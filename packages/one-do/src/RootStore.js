import {
  addDisposer,
  applySnapshot,
  dropFlow,
  flow,
  model,
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
  sortWith,
  toUpper,
} from './lib/ramda'
import {findById, overPath} from './lib/little-ramda'
import {
  authStateKnownPromise,
  isSignedIn,
  isSignedOut,
  signInWithPopup,
} from './firebase'
import {Layout} from './models/Layout'
import {Selection} from './models/Selection'
import {collection} from './models/Collection'
import {Task, TaskList} from './models/Task'

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
    trySync: flow(function*() {
      if (self.canSync) {
        yield self.sync()
      }
    }),
    ensureLogin: dropFlow(function*() {
      yield authStateKnownPromise
      if (isSignedOut()) {
        yield signInWithPopup()
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
