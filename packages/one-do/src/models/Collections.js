import {dropFlow, optional} from '../lib/little-mst'
import {collection} from './Collection'
import {Task, TaskList} from './Task'
import {isSignedIn} from '../firebase'
import {flow, types} from 'mobx-state-tree'

export const Collections = types
  .model('Collections', {
    taskListCollection: optional(collection(TaskList)),
    taskCollection: optional(collection(Task)),
  })
  .volatile(self => ({
    isSyncing: false,
  }))
  .views(self => ({
    get isDirty() {
      return self.taskCollection.isDirty || self.taskListCollection.isDirty
    },
    get canSync() {
      return isSignedIn() && self.isDirty && !self.isSyncing
    },
  }))
  .actions(self => ({
    sync: dropFlow(function*() {
      console.assert(isSignedIn())
      try {
        self.isSyncing = true
        yield self.taskListCollection.pushDirtyToRemote()
        yield self.taskCollection.pushDirtyToRemote()
        yield self.taskListCollection.pullFromRemote()
        yield self.taskCollection.pullFromRemote()
      } finally {
        self.isSyncing = false
      }
    }),
    trySync: flow(function*() {
      if (self.canSync) {
        yield self.sync()
      }
    }),
  }))
