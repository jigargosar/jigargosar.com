import {action, computed, observable, toJS} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {autobind} from '../lib/autobind'
import {
  always,
  compose,
  defaultTo,
  is,
  map,
  mergeWith,
  omit,
  unless,
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
class Collection {
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
    return map(model => model.snapshot)(this.models)
  }

  @computed
  get lsKey() {
    throw new Error('[Collection] lsKey not implemented')
  }

  @computed
  get model() {
    throw new Error('[Collection] model not implemented')
  }

  @action
  lsFetch() {
    const propsList = unless(is(Array))(always([]))(
      storage.get(this.lsKey),
    )
    this.removeAll()
    this.pushAllProps(propsList)
  }

  @autobind
  modelFromProps(props) {
    const modelClass = this.model
    const model = new modelClass(props, {collection: this})
    debugger
    return model
  }

  @action
  pushAllProps(propsList) {
    const models = map(this.modelFromProps)(propsList)
    this.models.push(...models)
  }

  lsSave() {
    return storage.set(this.lsKey, this.snapshot)
  }

  @computed
  get count() {
    return this.models.length
  }

  @action
  removeAll() {
    this.models.splice(0, this.count)
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

  findById(id) {
    return findById(id)(this.models)
  }
}

@autobind
class TaskStore extends Collection {
  @computed
  get lsKey() {
    return 'TaskCollection'
  }

  @computed
  get model() {
    return Task
  }

  @computed
  get tasks() {
    return this.models
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

taskStore.lsFetch()

disposers.autorun(taskStore.lsSave, {name: 'taskStore.lsSave'})

// taskStore.addNewTask()

export {taskStore}
