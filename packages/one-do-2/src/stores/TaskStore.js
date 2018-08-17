import {action, computed, observable, toJS} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {autobind} from '../lib/autobind'
import {
  compose,
  defaultTo,
  indexOf,
  map,
  mergeWith,
  omit,
} from '../lib/ramda'
import {findById, indexOfOrNaN, overProp} from '../lib/little-ramda'
import {taskView} from './index'
import {Disposers, setObservableProps} from '../lib/little-mobx'
import {storage} from '../lib/storage'

class Model {
  @observable collection

  constructor(props = {}, {collection = null} = {}) {
    this.collection = collection
    this.set(props)
  }

  @computed
  get snapshot() {
    const ownPropNames = Object.getOwnPropertyNames(Model.prototype)
    return compose(omit(ownPropNames), toJS)(this)
  }

  @action
  set(props) {
    setObservableProps(props, this)
  }

  @action.bound
  destroy() {
    console.assert(
      this.collection,
      'Calling destroy on model without an associated collection has no effect',
    )
    if (this.collection) {
      this.collection.destroy(this)
    }
  }
}

class Task extends Model {
  @observable id = `Task_${nanoid()}`
  @observable title = ''
  @observable isDone = false

  @action
  set(props) {
    setObservableProps(props, this)
  }

  @computed
  get isSelected() {
    return taskView.isTaskSelected(this)
  }

  @action.bound
  toggleDone() {
    this.set({isDone: !this.isDone})
  }
}

@autobind
class TaskStore {
  @observable models = []

  @action
  applySnapshot(snapshot) {
    const props = compose(
      overProp('models')(
        map(props => new Task(props, {collection: this})),
      ),
      mergeWith(defaultTo)({models: []}),
    )(snapshot)
    setObservableProps(props, this)
  }

  @computed
  get snapshot() {
    return compose(overProp('models')(map(model => model.snapshot)))(this)
  }

  indexOf(model) {
    return indexOfOrNaN(model)(this.models)
  }

  @action
  remove(model) {
    return this.models.splice(this.indexOf(model), 1)
  }

  @action
  destroy(model) {
    return this.remove(model)
  }

  @computed
  get tasks() {
    return this.models
  }

  findById(id) {
    return findById(id)(this.models)
  }

  @action
  addNewTask() {
    return this.addTask({title: fWord()})
  }

  @action
  addTask({title}) {
    const task = new Task({title}, {collection: this})
    this.models.unshift(task)
    return task
  }
}

const taskStore = new TaskStore()

const disposers = Disposers(module)

taskStore.applySnapshot(defaultTo({})(storage.get('taskStore')))

disposers.autorun(() => {
  console.table(taskStore.snapshot.models)
  console.log(`ts.snapshot`, taskStore.snapshot)
  storage.set('taskStore', taskStore.snapshot)
})

// taskStore.addNewTask()

export {taskStore}
