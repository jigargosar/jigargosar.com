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
import {_compose, clamp, defaultTo, nAry, pick} from './lib/ramda'
import {overProp} from './lib/little-ramda'
import {
  authState,
  firestoreUserCRefNamed,
  isSignedOut,
  signInWithPopup,
} from './firebase'
import {atomic} from 'mst-middlewares'
import pFinally from 'p-finally'

const Task = model('Task', {
  id: modelId('Task'),
  name: '',
}).actions(self => ({}))

const pDropConcurrentCalls = asyncFn => {
  let retPromise = null

  return (...args) => {
    if (!retPromise) {
      retPromise = asyncFn(...args)

      pFinally(retPromise, () => (retPromise = null))
    }

    return retPromise
  }
}

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
            const ret = yield cRef.doc(self.id).set(self.fireSnap)
            self.isDirty = false
            return ret
          }
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
    return {
      sync: decorate(
        atomic,
        pDropConcurrentCalls(
          flow(function*() {
            yield authState
            if (isSignedOut()) {
              yield signInWithPopup()
            }
            const taskListCRef = firestoreUserCRefNamed(
              TaskListCollection.name,
            )
            const qs = yield taskListCRef.get()
            console.log(`fireTaskLists`, qs.docs.map(qds => qds.data()))
            self.items.forEach(i => {
              // taskListCRef.doc(i.id).set(i.fireSnap)
              i.saveToFirestoreCollection(taskListCRef)
            })
          }),
        ),
      ),
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
    sync() {
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

function pf(ret) {
  return new Promise(resolve => {
    resolve(ret)
    // setTimeout(() => resolve(ret), 1000)
  })
}

const pfDrop = pDropConcurrentCalls(pf)

pfDrop(1).then(console.log)
pfDrop(2).then(console.log)

setImmediate(() => {
  pfDrop(3).then(console.log)
  pfDrop(4).then(console.log)
})
