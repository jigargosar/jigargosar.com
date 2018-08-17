import {
  action,
  computed,
  observable,
  observableGet,
  toJS,
} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {autobind} from '../lib/autobind'
import {
  compose,
  construct,
  constructN,
  defaultTo,
  isNil,
  map,
  merge,
  mergeWith,
  pick,
  prop,
} from '../lib/ramda'
import {
  filterDeleted,
  findById,
  overProp,
  rejectDeleted,
} from '../lib/little-ramda'
import {taskView} from './index'

class Model {
  constructor(attributes) {
    this.set(mergeWith(defaultTo)(this.defaults())(attributes))
  }

  @observable attributes = {id: null, sid: null}

  @computed
  get id() {
    return this.attributes.id
  }

  @computed
  get sid() {
    return this.attributes.sid
  }

  @computed
  get isNew() {
    return isNil(this.sid)
  }

  get(attribute) {
    return observableGet(this.attributes, attribute)
  }

  @action
  set(attributes) {
    Object.assign(this.attributes, attributes)
  }

  @autobind
  defaults() {
    return {}
  }
}

class Task extends Model {
  // @observable id = `Task_${nanoid()}`
  //
  // @observable title = ''
  //
  // @observable isDeleted = false
  //
  // @observable isDone = false
  //

  @autobind
  defaults() {
    return {
      id: `Task_${nanoid()}`,
      title: '',
      isDone: false,
      isDeleted: false,
    }
  }

  @computed
  get title() {
    return this.get('title')
  }

  @computed
  get isDeleted() {
    return this.get('isDeleted')
  }

  @computed
  get isDone() {
    return this.get('isDone')
  }

  @computed
  get isSelected() {
    return taskView.isTaskSelected(this)
  }

  @action.bound
  toggleDelete() {
    this.set({isDeleted: !this.isDeleted})
  }
  @action.bound
  toggleDone() {
    this.set({isDone: !this.isDone})
  }
}

@autobind
class TaskStore {
  @observable allTasks = []

  @computed
  get tasks() {
    return rejectDeleted(this.allTasks)
  }

  @computed
  get deletedTasks() {
    return filterDeleted(this.allTasks)
  }

  findById(id) {
    return findById(id)(this.allTasks)
  }

  @computed
  get snapshot() {
    return merge(toJS(this))({
      allTasks: map(prop('attributes'))(this.allTasks),
    })
  }

  @action
  addNewTask() {
    return this.addTask({title: fWord()})
  }

  @action
  addTask({title}) {
    const task = new Task({title})
    this.allTasks.unshift(task)
    return task
  }

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      pick(['allTasks']),
      overProp('allTasks')(map(attributes => new Task(attributes))),
      mergeWith(defaultTo)({allTasks: []}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskStore
