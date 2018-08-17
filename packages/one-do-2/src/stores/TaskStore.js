import {action, computed, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter, toggle} from 'mobx-decorators'
import {autobind} from '../lib/autobind'
import {
  compose,
  construct,
  defaultTo,
  map,
  mergeWith,
  pick,
} from '../lib/ramda'
import {
  filterDeleted,
  findById,
  overProp,
  rejectDeleted,
} from '../lib/little-ramda'
import {taskView} from './index'

class Task {
  @observable id = `Task_${nanoid()}`

  @observable title = ''

  @observable isDeleted = false

  @observable isDone = false

  constructor(snapshot) {
    Object.assign(this, snapshot)
  }

  @computed
  get isSelected() {
    return taskView.isTaskSelected(this)
  }

  @action.bound
  toggleDelete() {
    this.isDeleted = !this.isDeleted
  }
  @action.bound
  toggleDone() {
    this.isDone = !this.isDone
  }
}

const TaskConstructor = construct(Task)

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
      overProp('allTasks')(map(TaskConstructor)),
      mergeWith(defaultTo)({allTasks: []}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskStore
