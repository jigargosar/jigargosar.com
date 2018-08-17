import {
  action,
  computed,
  isObservable,
  isObservableProp,
  observable,
  observableKeys,
} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter, toggle} from 'mobx-decorators'
import {autobind} from '../lib/autobind'
import {
  compose,
  construct,
  curry,
  defaultTo,
  filter,
  keys,
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
  // @observable id
  //
  // @observable title
  //
  // @observable isDeleted
  //
  // @observable isDone

  disp = {f: 1}

  constructor(snapshot) {
    this.id = `Task_${nanoid()}`
    this.title = ``
    this.isDeleted = false
    this.isDone = false
    console.log('keys', observableKeys(this))
    console.log(`Object.keys(this)`, Object.keys(this))
    debugger
    // Object.assign(this, pick(ownPropertyNames)(snapshot))
  }

  @computed
  get isSelected() {
    return taskView.isTaskSelected(this)
  }

  @action.bound
  toggleDelete() {
    this.isDeleted = !this.isDeleted
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
    const task = TaskConstructor({title})
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
