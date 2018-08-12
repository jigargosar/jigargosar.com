import {
  addDisposer,
  applySnapshot,
  dropFlow,
  model,
  nullString,
  onSnapshot,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {
  _prop,
  ascend,
  compose,
  defaultTo,
  pluck,
  sortWith,
  sum,
  toUpper,
} from './lib/ramda'
import {findById, overPath} from './lib/little-ramda'
import {
  authStateKnownPromise,
  isSignedOut,
  signInWithPopup,
} from './firebase'
import {Layout} from './models/Layout'
import {Selection} from './models/Selection'
import {Collections} from './models/Collections'

const RootStoreBase = model('RootStore', {
  listSelection: Selection,
  editingTaskId: nullString,
  isAllListSelected: false,
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
  .actions(self => {
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
  })
  .views(self => ({
    get allListsPendingCount() {
      return compose(sum, pluck('pendingCount'))(self.lists)
    },
    get lists() {
      const activeLists = self.taskListCollection.activeItems
      return sortWith(
        //
        [ascend(compose(toUpper, _prop('name')))],
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
    isListSelected(list) {
      if (self.isAllListSelected) return false

      return self.listSelection.isSelected(list)
    },
    get canDeleteList() {
      return self.taskListCollection.activeItems.length > 1
    },
  }))
  .actions(self => ({
    setIsAllListSelected(bool) {
      self.isAllListSelected = bool
    },
    editTask(task) {
      self.editingTaskId = task.id
    },
    endEditTask() {
      self.editingTaskId = null
    },
    ensureLogin: dropFlow(function*() {
      yield authStateKnownPromise
      if (isSignedOut()) {
        yield signInWithPopup()
      }
    }),
    setSelectedList(l) {
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

const RootStore = types.compose(RootStoreBase, Layout, Collections)

export default RootStore
