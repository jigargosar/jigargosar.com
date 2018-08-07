import {
  addDisposer,
  applySnapshot,
  flow,
  getEnv,
  model,
  modelId,
  onSnapshot,
  spliceItem,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {
  _compose,
  _prop,
  clamp,
  defaultTo,
  equals,
  filter,
  forEach,
  map,
  merge,
  pick,
} from './lib/ramda'
import {overProp} from './lib/little-ramda'
import pSettle from 'p-settle'
import pForever from 'p-forever'
import delay from 'delay'
import store from './store'

const PCancelable = require('p-cancelable')

const Task = model('Task', {
  id: modelId('Task'),
  name: '',
}).actions(self => ({
  sync() {
    return getEnv(self).syncAdapter.syncItem('task', self.syncProps)
  },
}))

const TaskList = model('TaskList', {
  id: modelId('TaskList'),
  name: '',
  tasks: types.array(Task),
})
  .volatile(self => ({
    isSyncing: false,
  }))
  .actions(self => ({
    add(props) {
      self.tasks.push(Task.create(props))
    },
    delete(task) {
      spliceItem(task)(self.tasks)
    },
    sync() {
      return getEnv(self).syncAdapter.syncItem('taskList', self.syncProps)
    },
  }))
  .views(self => ({
    get syncProps() {
      return pick(['id', 'name'])(self)
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
