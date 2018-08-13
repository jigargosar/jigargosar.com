import {
  addDisposer,
  applySnapshot,
  dropFlow,
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
import {whenKeyPD, withKeyEvent} from './lib/little-react'
import {Task} from './models/Task'
import {types} from 'mobx-state-tree'

const RootStoreBase = types
  .model('RootStore', {
    listSelection: Selection,
    editingTask: types.maybeNull(Task),
    editingListId: nullString,
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
    get onKeyDown() {
      const keyMap = [
        //
        ['mod+/', 'Help'],
        ['mod+shift+f', 'Help'],
      ]

      return withKeyEvent(
        ...keyMap.map(([k, h]) => whenKeyPD(k)(self[`on${h}`])),
      )
    },
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
    get editingList() {
      return findById(self.editingListId)(self.lists)
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
    get contentViewName() {
      return self.isAllListSelected ? 'AllLists' : 'SelectedList'
    },
  }))
  .actions(self => ({
    onHelp() {
      alert('Help? wat!')
    },
    setIsAllListSelected(bool) {
      self.isAllListSelected = bool
    },
    editTask(task) {
      self.editingTaskId = task.id
    },
    endEditTask() {
      self.editingTaskId = null
    },
    editList(list) {
      self.editingListId = list.id
    },
    endEditList() {
      self.editingListId = null
    },
    ensureLogin: dropFlow(function*() {
      yield authStateKnownPromise
      if (isSignedOut()) {
        yield signInWithPopup()
      }
    }),
    setSelectedList(l) {
      self.listSelection.setSelectedItem(l)
      self.isAllListSelected = false
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
    addTask(props, list = self.selectedList) {
      self.taskCollection.add({...props, parentId: list.id})
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
