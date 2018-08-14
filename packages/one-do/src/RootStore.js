import {
  addDisposer,
  applySnapshot,
  clone,
  dropFlow,
  getType,
  isStateTreeNode,
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
import {overPath} from './lib/little-ramda'
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
    editingList: types.maybeNull(TaskList),
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
    get editingListId() {
      return pathOr(null)(['editingListId', 'id'])(self)
    },
    get tasks() {
      return self.selectedList.activeTasks
    },
    get selectedList() {
      return self.selectionFor(TaskList).selectedItem
    },
    get selectedTask() {
      return self.selectionFor(Task).selectedItem
    },
    isSelected(node) {
      if (TaskList.is(node) && self.isAllListSelected) return false

      return self.selectionFor(node).isSelected(node)
    },
    get canDeleteList() {
      return self.taskListCollection.activeItems.length > 1
    },
    get contentViewName() {
      return self.isAllListSelected ? 'AllLists' : 'SelectedList'
    },
    selectionFor(nodeOrType) {
      const lookup = new Map([
        [Task, self.taskSelection],
        [TaskList, self.listSelection],
      ])
      const type = when(isStateTreeNode)(getType)(nodeOrType)
      return lookup.get(type)
    },
    editItemFor(nodeOrType) {
      const lookup = new Map([
        [Task, self.editingTask],
        [TaskList, self.editingList],
      ])
      const type = when(isStateTreeNode)(getType)(nodeOrType)
      return lookup.get(type)
    },
    collectionFor(nodeOrType) {
      const lookup = new Map([
        [Task, self.taskCollection],
        [TaskList, self.taskListCollection],
      ])
      const type = when(isStateTreeNode)(getType)(nodeOrType)
      return lookup.get(type)
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
    editList(list) {
      self.editingList = clone(list)
    },
    endEditTask() {
      const originalTask = self.taskCollection.findById(
        self.editingTask.id,
      )
      self.updateItem(self.editingTask, originalTask)
      self.editingTask = null
      return originalTask
    },
    endEditList() {
      const originalList = self.taskListCollection.findById(
        self.editingList.id,
      )
      self.updateItem(self.editingList, originalList)
      self.editingList = null
      return originalList
    },
    ensureLogin: dropFlow(function*() {
      yield authStateKnownPromise
      if (isSignedOut()) {
        yield signInWithPopup()
      }
    }),
    addList: function(props) {
      self.taskListCollection.add(props)
    },
    addTask(props, list = self.selectedList) {
      self.taskCollection.add({...props, parentId: list.id})
    },
    updateItem(props, item) {
      self.collectionFor(item).update(props, item)
    },
    deleteItem(item) {
      if (TaskList.is(item) && !this.canDeleteList) {
        return
      }
      self.collectionFor(item).delete(item)
    },
    deleteList(list) {
      if (self.canDeleteList) {
        self.listCollection.delete(list)
      }
    },
    deleteTask(task) {
      self.taskCollection.delete(task)
    },
    setSelection(item) {
      if (TaskList.is(item)) {
        self.isAllListSelected = false
      }
      self.selectionFor(item).setSelectedItem(item)
    },
  }))

const RootStore = types.compose(RootStoreBase, Layout, Collections)

export default RootStore
