import {
  addDisposer,
  applySnapshot,
  model,
  modelId,
  onSnapshot,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {isEmpty} from './lib/ramda'

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
})
  .actions(lsActions)
  .actions(self => ({
    initStore: function() {
      if (isEmpty(self.taskLists)) {
        self.addTaskList({name: 'TODO'})
      }
    },
    addTaskList: function(props) {
      self.taskLists.unshift(TaskList.create(props))
    },
  }))

function lsActions(self) {
  const ls = StorageItem({name: 'rootSnapshot'})
  return {
    afterCreate() {
      self.initStore()
    },
    loadFromLS() {
      applySnapshot(self, ls.load())
      self.initStore()
    },
    reset() {
      applySnapshot(self, {})
      self.initStore()
    },
    saveToLSOnSnapshotChange() {
      addDisposer(self, onSnapshot(self, ls.save))
    },
  }
}

export default RootStore
