import {
  addDisposer,
  applySnapshot,
  model,
  modelId,
  onSnapshot,
  spliceItem,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {_compose, clamp, defaultTo} from './lib/ramda'
import {overProp} from './lib/little-ramda'
import {
  authState,
  firestoreUserCRefNamed,
  isSignedOut,
  signInWithPopup,
} from './firebase'

const Task = model('Task', {
  id: modelId('Task'),
  name: '',
}).actions(self => ({}))

const TaskList = model('TaskList', {
  id: modelId('TaskList'),
  name: '',
  tasks: types.array(Task),
}).actions(self => ({
  add(props) {
    self.tasks.push(Task.create(props))
  },
  delete(task) {
    spliceItem(task)(self.tasks)
  },
}))

const RootStore = model('RootStore', {
  lists: types.array(TaskList),
  _selectedIdx: 0,
})
  .preProcessSnapshot(snapshot => {
    const tl = TaskList.create({name: 'TODO'})
    return _compose(overProp('lists')(defaultTo([tl])))(snapshot)
  })
  .actions(lsActions)
  .views(self => ({
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
  .actions(self => ({
    afterCreate() {
      authState.then(async () => {
        if (isSignedOut()) {
          await signInWithPopup()
        }
        const qs = await firestoreUserCRefNamed('todos').get()
        console.log(`res`, qs.docs.map(qds => qds.data()))
      })
    },
    selectList(l) {
      self.selectedIdx = self.lists.indexOf(l)
    },
    addList: function(props) {
      self.lists.unshift(TaskList.create(props))
    },
    deleteList(list) {
      if (self.canDelete) {
        spliceItem(list)(self.lists)
      }
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
