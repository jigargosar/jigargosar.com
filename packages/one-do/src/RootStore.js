import {
  addDisposer,
  applySnapshot,
  model,
  modelId,
  onSnapshot,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {_compose, defaultTo, lensProp, over} from './lib/ramda'
import {overProp} from './lib/little-ramda'

const Task = model('Task', {
  id: modelId('Task'),
  name: '',
})
const TaskList = model('TaskList', {
  id: modelId('TaskList'),
  name: '',
  tasks: types.array(Task),
}).actions(self => ({
  add(props) {
    self.tasks.push(Task.create(props))
  },
}))

const RootStore = model('RootStore', {
  lists: types.array(TaskList),
  currentList: types.reference(TaskList),
})
  .preProcessSnapshot(snapshot => {
    const tl = TaskList.create({name: 'TODO'})
    return _compose(
      overProp('currentList')(defaultTo(tl)),
      overProp('lists')(defaultTo([tl])),
    )(snapshot)
  })
  .actions(lsActions)
  .actions(self => ({
    addList: function(props) {
      self.lists.unshift(TaskList.create(props))
    },
    deleteList(l) {
      self.lists.splice(self.lists.indexOf(l), 1)
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
