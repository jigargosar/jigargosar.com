import {
  addDisposer,
  applySnapshot,
  dropFlow,
  getRoot,
  getSnapshot,
  model,
  modelId,
  onSnapshot,
  optional,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {
  _compose,
  _prop,
  ascend,
  clamp,
  defaultTo,
  equals,
  filter,
  isNil,
  pick,
  propEq,
  reject,
  sortWith,
} from './lib/ramda'
import {findById, overPath} from './lib/little-ramda'
import {
  authState,
  firestoreUserCRefNamed,
  isSignedIn,
  isSignedOut,
  queryToDocsData,
  signInWithPopup,
} from './firebase'

function collection(Model) {
  const Collection = model(`${Model.name}Collection`, {
    items: types.optional(types.array(Model), []),
  })
    .volatile(self => ({}))
    .views(self => ({
      get dirtyItems() {
        return self.items.filter(_prop('isDirty'))
      },
      get activeItems() {
        return reject(_prop('isDeleted'))(self.items)
      },
      get isDirty() {
        return self.dirtyItems.length > 0
      },
    }))
    .actions(self => ({
      add(props) {
        self.items.push(Model.create(props))
      },
      delete(item) {
        item.update({isDeleted: true})
      },
      filter(fn) {
        return filter(fn)(self.items)
      },
      sync: dropFlow(function*() {
        console.assert(isSignedIn())
        const cRef = firestoreUserCRefNamed(Collection.name)

        const pushResult = yield Promise.all(
          self.dirtyItems.map(i => i.saveToCRef(cRef)),
        )
        console.log('[sync] push success', pushResult.length)

        const docsData = yield queryToDocsData(cRef)
        console.log(`[sync] pull result: docsData.length`, docsData.length)
        docsData.forEach(data => {
          const item = findById(data.id)(self.items)
          if (item) {
            item.loadFromRemoteData(data)
          } else {
            self.add({...data, isDirty: false})
          }
        })
      }),
    }))
  return Collection
}

const Task = model('Task', {
  id: modelId('Task'),
  name: '',
  parentId: types.reference(types.late(() => TaskList)),
  isDone: false,
  isDirty: true,
  isDeleted: false,
})
  .volatile(self => ({}))
  .views(self => ({
    get remoteProps() {
      return ['id', 'parentId', 'name', 'isDone', 'isDeleted']
    },
    get pickRemoteProps() {
      return pick(self.remoteProps)
    },
    get remoteSnap() {
      return self.pickRemoteProps(getSnapshot(self))
    },
  }))
  .actions(self => ({
    update(props) {
      const preUpdateSnap = self.remoteSnap
      Object.assign(self, self.pickRemoteProps(props))
      if (!self.isDirty && !equals(preUpdateSnap, self.remoteSnap)) {
        self.isDirty = true
      }
    },
    saveToCRef: dropFlow(function*(cRef) {
      console.assert(self.isDirty)
      const preSaveFireSnap = self.remoteSnap
      yield cRef.doc(self.id).set(preSaveFireSnap)
      if (equals(preSaveFireSnap, self.remoteSnap)) {
        self.isDirty = false
      }
    }),
    loadFromRemoteData(data) {
      if (self.isDirty) return
      const cleanProps = _compose(reject(isNil), self.pickRemoteProps)(
        data,
      )
      Object.assign(self, cleanProps)
    },
  }))

const TaskList = model('TaskList', {
  id: modelId('TaskList'),
  name: '',
  isDirty: true,
  isDeleted: false,
})
  .views(self => ({
    get taskCollection() {
      return getRoot(self).taskCollection
    },
    get tasks() {
      return self.taskCollection.filter(propEq('parentId', self))
    },
    get activeTasks() {
      return reject(_prop('isDeleted'))(self.tasks)
    },
  }))
  .views(self => ({
    get pickRemoteProps() {
      return pick(['id', 'name', 'isDeleted'])
    },
    get remoteSnap() {
      return self.pickRemoteProps(getSnapshot(self))
    },
  }))
  .actions(self => ({
    update(props) {
      const preUpdateSnap = self.remoteSnap
      Object.assign(self, self.pickRemoteProps(props))
      if (!self.isDirty && !equals(preUpdateSnap, self.remoteSnap)) {
        self.isDirty = true
      }
    },
    saveToCRef: dropFlow(function*(cRef) {
      console.assert(self.isDirty)
      const preSaveFireSnap = self.remoteSnap
      // const preSaveFireSnap2 = self.fireSnap
      // const preSaveFireSnap3 = self.fireSnap
      yield cRef.doc(self.id).set(preSaveFireSnap)
      if (equals(preSaveFireSnap, self.remoteSnap)) {
        self.isDirty = false
      }
    }),
    loadFromRemoteData(data) {
      if (self.isDirty) return
      Object.assign(self, self.pickRemoteProps(data))
    },
  }))

const TaskCollection = collection(Task)

const TaskListCollection = collection(TaskList)

const RootStore = model('RootStore', {
  taskListCollection: optional(TaskListCollection),
  taskCollection: optional(TaskCollection),
  _selectedIdx: 0,
})
  .preProcessSnapshot(snapshot => {
    const defaultList = {name: 'TODO'}
    const result = overPath(['taskListCollection', 'items'])(
      defaultTo([defaultList]),
    )(snapshot)

    console.debug('[RS] preProcessSnapshot result', result)
    return result
  })
  .actions(lsActions)
  .views(self => ({
    get lists() {
      const activeItems = self.taskListCollection.activeItems
      return sortWith([ascend(_prop('name'))])(activeItems)
    },
    get tasks() {
      return self.selectedList.activeTasks
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
      return self.taskListCollection.activeItems.length > 1
    },
  }))
  .volatile(self => ({}))
  .actions(self => ({
    sync: dropFlow(function*() {
      yield authState
      if (isSignedOut()) {
        yield signInWithPopup()
      }
      yield self.taskListCollection.sync()
      yield self.taskCollection.sync()
    }),
    syncIfDirty: dropFlow(function*() {
      const isDirty =
        self.taskCollection.isDirty || self.taskListCollection.isDirty

      if (isDirty) {
        yield self.sync()
      }
    }),
    selectList(l) {
      self.selectedIdx = self.lists.indexOf(l)
    },
    addList: function(props) {
      self.taskListCollection.add(props)
    },
    deleteList(props) {
      if (self.canDelete) {
        self.taskListCollection.delete(props)
      }
    },
    updateList(props, list) {
      list.update(props)
    },
    addTask(props) {
      self.taskCollection.add({...props, parentId: self.selectedList.id})
    },
    deleteTask(props) {
      self.taskCollection.delete(props)
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
