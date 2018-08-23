import {action, computed, observable, toJS} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {randomWord} from '../lib/fake'
import {autobind} from '../lib/autobind'
import {
  always,
  compose,
  filter,
  head,
  is,
  map,
  omit,
  unless,
} from '../lib/ramda'
import {findById, indexOfOrNaN} from '../lib/little-ramda'
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
    const propsList = compose(
      filter(is(Object)),
      unless(is(Array))(always([])),
    )(storage.get(this.lsKey))
    this.removeAll()
    this.pushAllProps(propsList)
  }

  @autobind
  modelFromProps(props) {
    const modelClass = this.model
    return new modelClass(props, {collection: this})
  }

  @autobind
  modelFromPropsList(propsList) {
    return map(this.modelFromProps)(propsList)
  }

  @action
  pushAllProps(propsList) {
    const models = this.modelFromPropsList(propsList)
    this.models.push(...models)
    return models
  }

  @action
  pushProps(props) {
    return head(this.pushAllProps([props]))
  }

  @action
  unshiftAllProps(propsList) {
    const models = this.modelFromPropsList(propsList)
    this.models.unshift(...models)
    return models
  }

  @action
  unshiftProps(props) {
    return head(this.pushAllProps([props]))
  }

  @action
  addProps(props) {
    return this.pushProps(props)
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
class TaskCollection extends Collection {
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
    return this.unshiftProps({title: randomWord()})
  }
}

const taskStore = new TaskCollection()

const disposers = Disposers(module)

taskStore.lsFetch()

disposers.autorun(taskStore.lsSave, {name: 'taskStore.lsSave'})

export {taskStore}
