import {action, computed, observable, toJS} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {autobind} from '../lib/autobind'
import {compose, map, omit} from '../lib/ramda'
import {
  filterDeleted,
  findById,
  overProp,
  rejectDeleted,
} from '../lib/little-ramda'
import {taskView} from './index'
import {Disposers, setObservableProps} from '../lib/little-mobx'

class Model {
  @observable collection = {}

  constructor(props = {}) {
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
  destroy() {
    if (this.collection) {
      this.collection.destroy(this)
    }
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
    const props = compose(
      overProp('allTasks')(map(props => new Task(props))),
    )(snapshot)
    setObservableProps(props, this)
  }

  @computed
  get snapshot() {
    return this.allTasks.map(m => m.snapshot)
  }
}

export default TaskStore

const ts = new TaskStore()

const disposers = Disposers(module)

disposers.autorun(() => console.log(`ts.snapshot`, ts.snapshot))

ts.addNewTask()
