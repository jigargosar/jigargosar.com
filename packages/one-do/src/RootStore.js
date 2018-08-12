import {
  addDisposer,
  applySnapshot,
  dropFlow,
  flow,
  getRoot,
  getSnapshot,
  model,
  modelId,
  nullString,
  onSnapshot,
  optional,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {
  _compose,
  _prop,
  ascend,
  compose,
  defaultTo,
  equals,
  filter,
  isNil,
  pick,
  propEq,
  reject,
  sortWith,
  toUpper,
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
import {Layout} from './models/Layout'
import {Selection} from './models/Selection'

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
        self.update({isDeleted: true}, item)
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
    get pendingTasks() {
      return reject(_prop('isDone'))(self.activeTasks)
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

const RootStoreExt = model('RootStore', {
  taskListCollection: optional(collection(TaskList)),
  taskCollection: optional(collection(Task)),
  listSelection: optional(Selection, {targetPathFromRoot: ['lists']}),
  editingTaskId: nullString,
})
  .preProcessSnapshot(snapshot => {
    const defaultList = {name: 'TODO'}
    const result = compose(
      overPath(['listSelection', 'targetPathFromRoot'])(
        defaultTo(['lists']),
      ),
      overPath(['taskListCollection', 'items'])(defaultTo([defaultList])),
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
      const activeLists = self.taskListCollection.activeItems
      return sortWith(
        //
        [ascend(_compose(toUpper, _prop('name')))],
      )(activeLists)
    },
    get editingTask() {
      return findById(self.editingTaskId)(self.tasks)
    },
    get tasks() {
      return self.selectedList.activeTasks
    },
    get selectedList() {
      return self.listSelection.selectedItem
    },
    isSelected(l) {
      return self.listSelection.isSelected(l)
    },
    get canDeleteList() {
      return self.taskListCollection.activeItems.length > 1
    },
    get canSync() {
      return isSignedIn() && self.isDirty && !self.isSyncing
    },
  }))
  .volatile(self => ({
    isSyncing: false,
  }))
  .actions(self => ({
    editTask(task) {
      self.editingTaskId = task.id
    },
    endEditTask() {
      self.editingTaskId = null
    },
    sync: dropFlow(function*() {
      console.assert(isSignedIn())
      try {
        self.isSyncing = true
        yield self.taskListCollection.pushDirtyToRemote()
        yield self.taskCollection.pushDirtyToRemote()
        yield self.taskListCollection.pullFromRemote()
        yield self.taskCollection.pullFromRemote()
      } finally {
        self.isSyncing = false
      }
    }),
    ensureLogin: dropFlow(function*() {
      yield authStateKnownPromise
      if (isSignedOut()) {
        yield signInWithPopup()
      }
    }),
    trySync: flow(function*() {
      if (self.canSync) {
        yield self.sync()
      }
    }),
    selectList(l) {
      self.listSelection.setSelectedItem(l)
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

const RootStore = types.compose(RootStoreExt, Layout)

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
