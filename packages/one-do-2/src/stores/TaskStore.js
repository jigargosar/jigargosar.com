import {action, computed, observable, observableKeys} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {autobind} from '../lib/autobind'
import {compose, defaultTo, keys, map, mergeWith, pick} from '../lib/ramda'
import {
  filterDeleted,
  findById,
  overProp,
  rejectDeleted,
} from '../lib/little-ramda'
import {taskView} from './index'

class Task {
  @observable id

  @observable title

  @observable isDeleted

  @observable isDone

  @autobind
  defaults() {
    return {
      id: `Task_${nanoid()}`,
      title: '',
      isDone: false,
      isDeleted: false,
    }
  }

  constructor(props) {
    const defaultProps = this.defaults()
    const mergeWithDefaults = mergeWith(defaultTo)(defaultProps)
    const propsWithDefault = compose(mergeWithDefaults, defaultTo({}))(
      props,
    )
    this.set(propsWithDefault)
  }

  @action
  set(props) {
    Object.assign(this, props)
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
      overProp('allTasks')(map(props => new Task(props))),
      mergeWith(defaultTo)({allTasks: []}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskStore
