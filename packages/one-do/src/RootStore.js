import {
  addDisposer,
  applySnapshot,
  dropFlow,
  flow,
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
  authStateKnownPromise,
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
        return self.filter(_prop('isDirty'))
      },
      get activeItems() {
        return reject(_prop('isDeleted'))(self.items)
      },
      get isDirty() {
        return self.dirtyItems.length > 0
      },
      filter(fn) {
        return filter(fn)(self.items)
      },
    }))
    .actions(self => ({
      add(props) {
        self.items.push(Model.create(props))
      },
      update(props, item) {
        const preUpdateSnap = item.remoteSnap
        Object.assign(item, item.pickRemoteProps(props))
        if (!item.isDirty && !equals(preUpdateSnap, item.remoteSnap)) {
          item.isDirty = true
        }
      },
      saveToCRef: flow(function*(cRef, item) {
        console.assert(item.isDirty)
        const preSaveFireSnap = item.remoteSnap
        yield cRef.doc(item.id).set(preSaveFireSnap)
        if (equals(preSaveFireSnap, item.remoteSnap)) {
          item.isDirty = false
        }
      }),
      loadFromRemoteData(data, item) {
        if (item.isDirty) return
        const cleanProps = _compose(reject(isNil), item.pickRemoteProps)(
          data,
        )
        Object.assign(item, cleanProps)
      },
      delete(item) {
        item.update({isDeleted: true})
      },
      pullFromRemote: dropFlow(function*() {
        console.assert(isSignedIn())
        const cRef = firestoreUserCRefNamed(Collection.name)

        const docsData = yield queryToDocsData(cRef)
        console.log(`[sync] pull result: docsData.length`, docsData.length)
        docsData.forEach(data => {
          const item = findById(data.id)(self.items)
          if (item) {
            self.loadFromRemoteData(data, item)
          } else {
            self.add({...data, isDirty: false})
          }
        })
      }),
      pushDirtyToRemote: dropFlow(function*() {
        console.assert(isSignedIn())
        const cRef = firestoreUserCRefNamed(Collection.name)

        const pushResult = yield Promise.all(
          self.dirtyItems.map(item => self.saveToCRef(cRef, item)),
        )
        console.log('[sync] push success', pushResult.length)
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
    get isDirty() {
      return self.taskCollection.isDirty || self.taskListCollection.isDirty
    },
    get lists() {
      const activeItems = self.taskListCollection.activeItems
      return sortWith([ascend(_prop('name'))])(activeItems)
    },
    get tasks() {
      return self.selectedList.activeTasks
    },
    set selectedIdx(val) {
      return (self._selectedIdx = val)
    },
    get selectedIdx() {
      return clamp(0, self.lists.length - 1)(self._selectedIdx)
    },
    get selectedList() {
      return self.lists[self.selectedIdx]
    },
    isSelected(l) {
      return self.selectedList === l
    },
    get canDeleteList() {
      return self.taskListCollection.activeItems.length > 1
    },
  }))
  .volatile(self => ({}))
  .actions(self => ({
    sync: dropFlow(function*() {
      yield authStateKnownPromise
      if (isSignedOut()) {
        yield signInWithPopup()
      }
      yield self.taskListCollection.pushDirtyToRemote()
      yield self.taskCollection.pushDirtyToRemote()
      yield self.taskListCollection.pullFromRemote()
      yield self.taskCollection.pullFromRemote()
    }),
    syncIfDirty: dropFlow(function*() {
      if (self.isDirty) {
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
      if (self.canDeleteList) {
        self.taskListCollection.delete(props)
      }
    },
    updateList(props, list) {
      self.taskListCollection.update(props, list)
    },
    addTask(props) {
      self.taskCollection.add({...props, parentId: self.selectedList.id})
    },
    deleteTask(props) {
      self.taskCollection.delete(props)
    },
    updateTask(props, task) {
      self.taskCollection.update(props, task)
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
      const disposer = onSnapshot(self, ls.save)
      addDisposer(self, disposer)
      return disposer
    },
  }
}

export default RootStore

window.f.firestore().collection('users')
