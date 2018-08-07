import {
  addDisposer,
  applySnapshot,
  model,
  modelId,
  onSnapshot,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {_compose, defaultTo, isEmpty, lensProp, over} from './lib/ramda'

const Task = model('Task', {
  id: modelId('Task'),
  name: '',
})
const TaskList = model('TaskList', {
  id: modelId('TaskList'),
  name: '',
  tasks: types.array(Task),
})

const RootStore = model('RootStore', {
  taskLists: types.array(TaskList),
  currentList: types.reference(TaskList),
})
  .preProcessSnapshot(snapshot => {
    const tl = TaskList.create({name: 'TODO'})
    return _compose(
      over(lensProp('currentList'))(_compose(defaultTo(tl))),
      over(lensProp('taskLists'))(_compose(defaultTo([tl]))),
    )(snapshot)
  })
  .actions(lsActions)
  .actions(self => ({
    addTaskList: function(props) {
      self.taskLists.unshift(TaskList.create(props))
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
