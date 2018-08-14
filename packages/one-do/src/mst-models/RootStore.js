import {
  addDisposer,
  applySnapshot,
  clone,
  Disposers,
  dropFlow,
  getType,
  isStateTreeNode,
  observable,
  onSnapshot,
  optional,
  types,
} from '../lib/little-mst'
import {StorageItem} from '../lib/storage'
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
} from '../lib/ramda'
import {overPath} from '../lib/little-ramda'
import {
  authStateKnownPromise,
  isSignedOut,
  signInWithPopup,
} from '../lib/firebase'
import {Selection} from './Selection'
import {Collections} from './Collections'
import {whenKeyPD, withKeyEvent} from '../lib/little-react'
import {Task, TaskList} from './Task'
import {extendObservable} from '../lib/mobx'

const RootStore = types
  .model('RootStore', {
    listSelection: Selection,
    taskSelection: Selection,
    // editingTask: types.maybeNull(Task),
    // editingList: types.maybeNull(TaskList),
    isAllListSelected: false,
    collections: optional(Collections),
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
      overPath(['collections', 'taskListCollection', 'items'])(
        defaultTo([defaultList]),
      ),
    )(snapshot)

    console.debug('[RS] preProcessSnapshot result', result)
    return result
  })
  .volatile(self => ({
    // editingTask: null,
    // editingList: null,
  }))
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
    get taskListCollection() {
      return self.collections.taskListCollection
    },
    get taskCollection() {
      return self.collections.taskCollection
    },

    get isDirty() {
      return self.collections.isDirty
    },

    get isSyncing() {
      return self.collections.isSyncing
    },

    get trySync() {
      return self.collections.trySync
    },
  }))
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
    collectionFor(nodeOrType) {
      const lookup = new Map([
        [Task, self.taskCollection],
        [TaskList, self.taskListCollection],
      ])
      const type = when(isStateTreeNode)(getType)(nodeOrType)
      return lookup.get(type)
    },
    editItemPNFor(nodeOrType) {
      const lookup = new Map([
        [Task, 'editingTask'],
        [TaskList, 'editingList'],
      ])
      const type = when(isStateTreeNode)(getType)(nodeOrType)
      return lookup.get(type)
    },
    editItemFor(nodeOrType) {
      return self[self.editItemPNFor(nodeOrType)]
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
    editItem(item) {
      self[self.editItemPNFor(item)] = clone(item)
    },
    endEditForType(type) {
      const editingItem = self[self.editItemPNFor(type)]
      const originalItem = self
        .collectionFor(type)
        .findById(editingItem.id)
      self.updateItem(editingItem, originalItem)
      self[self.editItemPNFor(type)] = null
      return originalItem
    },
    endEditTask() {
      return self.endEditForType(Task)
    },
    endEditList() {
      return self.endEditForType(TaskList)
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
      if (TaskList.is(item) && !self.canDeleteList) {
        return
      }
      self.collectionFor(item).delete(item)
    },
    setSelection(item) {
      if (TaskList.is(item)) {
        self.isAllListSelected = false
      }
      self.selectionFor(item).setSelectedItem(item)
    },
  }))

export default RootStore

const store = observable({
  isLayoutMobile: true,
  isDrawerOpen: false,
})

const setterFor = o => pn => val => (o[pn] = val)
const toggleFor = o => pn => (bool = !Boolean(o[pn])) => (o[pn] = bool)

const setter = setterFor(store)
const setterWithDefault = pn => val => () => setterFor(store)(pn)(val)
const toggle = toggleFor(store)

export const toggleIsDrawerOpen = toggle('isDrawerOpen')

export const xStore = extendObservable(store, {
  get drawerVariant() {
    return store.isLayoutMobile ? 'temporary' : 'persistent'
  },
  get isDrawerTemporary() {
    return store.drawerVariant === 'temporary'
  },
  setIsLayoutMobile: setter('isLayoutMobile'),
  toggleIsDrawerOpen,
  closeDrawer: setterWithDefault('isDrawerOpen', false),
  closeDrawerIfTemporary() {
    if (store.isDrawerTemporary) {
      store.closeDrawer()
    }
  },
})

const disposers = Disposers(module)

disposers.reaction(
  () => xStore.isLayoutMobile,
  () => {
    xStore.isDrawerOpen = !xStore.isLayoutMobile
  },
)

if (module.hot) {
  window.xsr = xStore
}
export const handleToggleDrawer = val => e => toggleIsDrawerOpen(val)
