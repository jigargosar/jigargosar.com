import {
  addDisposer,
  applySnapshot,
  dropFlow,
  getParentOfType,
  model,
  modelId,
  onSnapshot,
  optional,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {
  _prop,
  ascend,
  clamp,
  defaultTo,
  equals,
  pick,
  reject,
  sortWith,
} from './lib/ramda'
import {findById, overProp} from './lib/little-ramda'
import {
  authState,
  firestoreUserCRefNamed,
  isSignedIn,
  isSignedOut,
  queryToDocsData,
  signInWithPopup,
} from './firebase'

const Task = model('Task', {
  id: modelId('Task'),
  name: '',
  isDone: false,
  isDirty: true,
  isDeleted: false,
})
  .volatile(self => ({}))
  .views(self => ({
    get parentListId() {
      return getParentOfType(self, TaskList)
    },
    get pickFireProps() {
      return pick(['id', 'name', 'isDone', 'isDeleted'])
    },
    get fireSnap() {
      return self.pickFireProps(self)
    },
  }))
  .actions(self => ({
    update(props) {
      const preUpdateSnap = self.fireSnap
      Object.assign(self, self.pickFireProps(props))
      if (!self.isDirty && !equals(preUpdateSnap, self.fireSnap)) {
        self.isDirty = true
      }
    },
    saveToCRef: dropFlow(function*(cRef) {
      console.assert(self.isDirty)
      const preSaveFireSnap = self.fireSnap
      yield cRef.doc(self.id).set(preSaveFireSnap)
      if (equals(preSaveFireSnap, self.fireSnap)) {
        self.isDirty = false
      }
    }),
    loadFromFireData(data) {
      if (self.isDirty) return
      Object.assign(self, self.pickFireProps(data))
    },
  }))

const TaskList = model('TaskList', {
  id: modelId('TaskList'),
  name: '',
  isDirty: true,
  isDeleted: false,
  tasks: types.array(Task),
})
  .views(self => ({
    get pickFireProps() {
      return pick(['id', 'name', 'isDeleted'])
    },
    get fireSnap() {
      return self.pickFireProps(self)
    },
    get activeTasks() {
      return reject(_prop('isDeleted'))(self.tasks)
    },
  }))
  .actions(self => ({
    update(props) {
      const preUpdateSnap = self.fireSnap
      Object.assign(self, self.pickFireProps(props))
      if (!self.isDirty && !equals(preUpdateSnap, self.fireSnap)) {
        self.isDirty = true
      }
    },
    add(props) {
      self.tasks.push(Task.create(props))
    },
    delete(task) {
      // spliceItem(task)(self.tasks)
      task.update({isDeleted: true})
    },
    saveToCRef: dropFlow(function*(cRef) {
      console.assert(self.isDirty)
      const preSaveFireSnap = self.fireSnap
      yield cRef.doc(self.id).set(preSaveFireSnap)
      if (equals(preSaveFireSnap, self.fireSnap)) {
        self.isDirty = false
      }
    }),
    loadFromFireData(data) {
      if (self.isDirty) return
      Object.assign(self, self.pickFireProps(data))
    },
  }))

const TaskListCollection = model('TaskListCollection', {
  items: types.array(TaskList),
})
  .preProcessSnapshot(snapshot => {
    const tl = TaskList.create({name: 'TODO'})
    return overProp('items')(defaultTo([tl]))(snapshot)
  })
  .views(self => ({
    get canDelete() {
      return self.activeItems.length > 1
    },
    get dirtyItems() {
      return self.items.filter(_prop('isDirty'))
    },
    get activeItems() {
      return reject(_prop('isDeleted'))(self.items)
    },
  }))
  .actions(self => {
    return {
      sync: dropFlow(function*() {
        yield self.syncLists()
      }),
      syncLists: dropFlow(function*() {
        console.assert(isSignedIn())
        const cRef = firestoreUserCRefNamed(TaskListCollection.name)

        const pushResult = yield Promise.all(
          self.dirtyItems.map(i => i.saveToCRef(cRef)),
        )
        console.log('[sync] push success', pushResult.length)

        const docsData = yield queryToDocsData(cRef)
        console.log(`[sync] pull result: docsData.length`, docsData.length)
        docsData.forEach(data => {
          const item = findById(data.id)(self.items)
          if (item) {
            item.loadFromFireData(data)
          } else {
            self.add(data)
          }
        })
      }),
      syncTasks: dropFlow(function*() {
        console.assert(isSignedIn())
        const cRef = firestoreUserCRefNamed(TaskList.name)

        const pushResult = yield Promise.all(
          self.dirtyTasks.map(task => task.saveToCRef(cRef)),
        )
        console.log('[sync tasks] push success', pushResult.length)

        const docsData = yield queryToDocsData(cRef)
        console.log(
          `[sync tasks] pull result: docsData.length`,
          docsData.length,
        )
        docsData.forEach(data => {
          const task = findById(data.id)(self.tasks)
          if (task) {
            task.loadFromFireData(data)
          } else {
            self.add(data)
          }
        })
      }),
      add: function(props) {
        self.items.push(TaskList.create(props))
      },
      delete(item) {
        if (self.canDelete) {
          // spliceItem(item)(self.items)
          item.update({isDeleted: true})
        }
      },
    }
  })

const RootStore = model('RootStore', {
  taskListCollection: optional(TaskListCollection, {}),
  _selectedIdx: 0,
})
  .actions(lsActions)
  .views(self => ({
    get lists() {
      const activeItems = self.taskListCollection.activeItems
      return sortWith([ascend(_prop('name'))])(activeItems)
    },
    get tasks() {
      return self.selectedList.tasks
    },
    get selectedIdx() {
      return clamp(0, self.lists.length - 1)(self._selectedIdx)
    },
    set selectedIdx(val) {
      return (self._selectedIdx = val)
    },
    get selectedList() {
      return self.lists[self.selectedIdx]
    },
    isSelected(l) {
      return self.selectedList === l
    },
    get canDelete() {
      return self.taskListCollection.canDelete
    },
  }))
  .volatile(self => ({}))
  .actions(self => ({
    sync: dropFlow(function*() {
      yield authState
      if (isSignedOut()) {
        yield signInWithPopup()
      }
      self.taskListCollection.sync()
    }),
    selectList(l) {
      self.selectedIdx = self.lists.indexOf(l)
    },
    addList: function(props) {
      self.taskListCollection.add(props)
    },
    deleteList(props) {
      self.taskListCollection.delete(props)
    },
    updateList(props, list) {
      list.update(props)
    },
    addTask(props) {
      self.selectedList.add(props)
    },
    deleteTask(props) {
      self.selectedList.delete(props)
    },
    updateTask(props, task) {
      task.update(props)
    },
  }))

function lsActions(self) {
  const ls = StorageItem({name: 'rootSnapshot'})
  return {
    loadFromLS() {
      applySnapshot(self, ls.load())
    },
    reset() {
      applySnapshot(self, {})
    },
    saveToLSOnSnapshotChange() {
      addDisposer(self, onSnapshot(self, ls.save))
    },
  }
}

export default RootStore

window.f.firestore().collection('users')
