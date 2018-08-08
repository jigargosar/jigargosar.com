import {
  addDisposer,
  applySnapshot,
  decorate,
  flow,
  model,
  modelId,
  onSnapshot,
  optional,
  spliceItem,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {_compose, clamp, defaultTo, pick} from './lib/ramda'
import {overProp} from './lib/little-ramda'
import {
  authState,
  firestoreUserCRefNamed,
  isSignedOut,
  signInWithPopup,
} from './firebase'
import {atomic} from 'mst-middlewares'

const Task = model('Task', {
  id: modelId('Task'),
  name: '',
}).actions(self => ({}))

const atomicFlow = fn => decorate(atomic, flow(fn))

const TaskList = model('TaskList', {
  id: modelId('TaskList'),
  name: '',
  isDirty: true,
  tasks: types.array(Task),
})
  .volatile(self => ({
    isSaving: false,
  }))
  .views(self => ({
    get fireSnap() {
      return pick(['id', 'name'])(self)
    },
  }))
  .actions(self => ({
    add(props) {
      self.tasks.push(Task.create(props))
    },
    delete(task) {
      spliceItem(task)(self.tasks)
    },
    saveToFire: atomicFlow(function*(dRef) {
      if (self.isSaving || !self.isDirty) {
        return
      }
      if (!self.isSaving) {
        self.isSaving = true
        if (self.isDirty) {
          yield dRef.set(self.fireSnap)
          self.isDirty = false
        }
        self.isSaving = false
      }
    }),
  }))

const TaskListCollection = model('TaskListCollection', {
  items: types.array(TaskList),
})
  .preProcessSnapshot(snapshot => {
    const tl = TaskList.create({name: 'TODO'})
    return _compose(overProp('items')(defaultTo([tl])))(snapshot)
  })
  .volatile(self => ({isSyncing: false}))
  .views(self => ({
    get canDelete() {
      return self.items.length > 1
    },
  }))
  .actions(self => ({
    sync: flow(function*() {
      yield authState
      if (isSignedOut()) {
        yield signInWithPopup()
      }
      const taskListCRef = firestoreUserCRefNamed(TaskListCollection.name)
      const qs = yield taskListCRef.get()
      console.log(`fireTaskLists`, qs.docs.map(qds => qds.data()))
      self.items.forEach(l => {
        taskListCRef.doc(l.id).set(l.fireSnap)
      })
    }),
    add: function(props) {
      self.items.unshift(TaskList.create(props))
    },
    delete(item) {
      if (self.canDelete) {
        spliceItem(item)(self.items)
      }
    },
  }))

const RootStore = model('RootStore', {
  taskListCollection: optional(TaskListCollection, {}),
  _selectedIdx: 0,
})
  .actions(lsActions)
  .views(self => ({
    get lists() {
      return self.taskListCollection.items
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
      return self.lists.length > 1
    },
  }))
  .volatile(self => ({}))
  .actions(self => ({
    afterCreate() {
      self.taskListCollection.sync()
    },
    selectList(l) {
      self.selectedIdx = self.lists.indexOf(l)
    },
    addList: function(props) {
      self.lists.add(props)
    },
    deleteList(props) {
      self.taskListCollection.delete(props)
    },
    addTask(props) {
      self.currentList.add(props)
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
