import {
  addDisposer,
  applySnapshot,
  decorate,
  dropFlow,
  flow,
  model,
  modelId,
  onSnapshot,
  optional,
  spliceItem,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {_compose, _prop, clamp, defaultTo, pick} from './lib/ramda'
import {overProp, pDropConcurrentCalls} from './lib/little-ramda'
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

const TaskList = model('TaskList', {
  id: modelId('TaskList'),
  name: '',
  isDirty: true,
  tasks: types.array(Task),
})
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
    saveToFirestoreCollection: decorate(
      atomic,
      pDropConcurrentCalls(
        flow(function*(cRef) {
          if (self.isDirty) {
            yield cRef.doc(self.id).set(self.fireSnap)
            self.isDirty = false
            return 'saveToFirestoreCollection Success'
          }
          return 'saveToFirestoreCollection notDirty'
        }),
      ),
    ),
  }))

const TaskListCollection = model('TaskListCollection', {
  items: types.array(TaskList),
})
  .preProcessSnapshot(snapshot => {
    const tl = TaskList.create({name: 'TODO'})
    return _compose(overProp('items')(defaultTo([tl])))(snapshot)
  })
  .views(self => ({
    get canDelete() {
      return self.items.length > 1
    },
  }))
  .actions(self => {
    const generator = function*() {
      if (isSignedOut()) {
        return
      }
      const cRef = firestoreUserCRefNamed(TaskListCollection.name)
      // const qs = yield cRef.get()
      // const docs = qs.docs
      // console.debug(
      //   `[sync] fireTaskLists`,
      //   docs.map(qds => qds.data()),
      // )
      // console.log(`[sync] fireTaskLists: docs.length`, docs.length)
      const saveResult = yield Promise.all(
        self.items
          .filter(_prop('isDirty'))
          .map(i => i.saveToFirestoreCollection(cRef)),
      )
      console.log('[sync] saveResult', saveResult)
    }
    return {
      sync: dropFlow(generator),
      add: function(props) {
        self.items.unshift(TaskList.create(props))
      },
      delete(item) {
        if (self.canDelete) {
          spliceItem(item)(self.items)
        }
      },
    }
  })

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
    sync: pDropConcurrentCalls(
      flow(function*() {
        yield authState
        if (isSignedOut()) {
          yield signInWithPopup()
        }
        self.taskListCollection.sync()
      }),
    ),
    selectList(l) {
      self.selectedIdx = self.lists.indexOf(l)
    },
    addList: function(props) {
      self.taskListCollection.add(props)
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
