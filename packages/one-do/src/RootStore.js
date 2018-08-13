import {
  addDisposer,
  applySnapshot,
  clone,
  dropFlow,
  getType,
  isStateTreeNode,
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
  pathOr,
  pluck,
  sortWith,
  sum,
  toUpper,
  when,
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
import {Task, TaskList} from './models/Task'

const RootStoreBase = types
  .model('RootStore', {
    listSelection: Selection,
    taskSelection: Selection,
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
      overPath(['taskSelection', 'targetPathFromRoot'])(
        defaultTo(['tasks']),
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
    get editingTaskId() {
      return pathOr(null)(['editingTask', 'id'])(self)
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
    selectionFor(nodeOrType) {
      const selectionMap = new Map([
        [Task, self.taskSelection],
        [TaskList, self.listSelection],
      ])
      const type = when(isStateTreeNode)(getType)(nodeOrType)
      return selectionMap.get(type)
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
      self.editingTask = clone(task)
    },
    endEditTask() {
      const originalTask = self.taskCollection.findById(
        self.editingTask.id,
      )
      self.updateTask(self.editingTask, originalTask)
      self.editingTask = null
      return originalTask
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
    deleteTask(task) {
      const taskToDelete =
        self.editingTaskId === task.id ? self.endEditTask() : task
      self.taskCollection.delete(taskToDelete)
    },
    updateTask(props, task) {
      self.taskCollection.update(props, task)
    },
    setSelection(item) {
      self.selectionFor(item).setSelectedItem(item)
    },
  }))

const RootStore = types.compose(RootStoreBase, Layout, Collections)

export default RootStore
