import {modelId} from '../lib/little-mst'
import {getRoot, getSnapshot, types} from 'mobx-state-tree'
import {pick, propEq, reject} from 'ramda'
import {_prop} from '../lib/ramda'

export const Task = types
  .model('Task', {
    id: modelId('Task'),
    name: '',
    parentId: types.reference(types.late(() => TaskList)),
    isDone: false,
    isDirty: true,
    isDeleted: false,
  })
  .volatile(self => ({}))
  .views(self => ({
    get remoteProps() {
      return ['id', 'parentId', 'name', 'isDone', 'isDeleted']
    },
    get pickRemoteProps() {
      return pick(self.remoteProps)
    },
    get remoteSnap() {
      return self.pickRemoteProps(getSnapshot(self))
    },
  }))
export const TaskList = types
  .model('TaskList', {
    id: modelId('TaskList'),
    name: '',
    isDirty: true,
    isDeleted: false,
  })
  .views(self => ({
    get taskCollection() {
      return getRoot(self).taskCollection
    },
    get tasks() {
      return self.taskCollection.filter(propEq('parentId', self))
    },
    get activeTasks() {
      return reject(_prop('isDeleted'))(self.tasks)
    },
    get pendingTasks() {
      return reject(_prop('isDone'))(self.activeTasks)
    },
    get pendingCount() {
      return self.pendingTasks.length
    },
  }))
  .views(self => ({
    get pickRemoteProps() {
      return pick(['id', 'name', 'isDeleted'])
    },
    get remoteSnap() {
      return self.pickRemoteProps(getSnapshot(self))
    },
  }))
