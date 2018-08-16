import {action, computed, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter, toggle} from 'mobx-decorators'
import {autobind} from '../lib/autobind'
import {compose, construct, defaultTo, map, mergeWith} from '../lib/ramda'
import {
  filterDeleted,
  findById,
  overProp,
  rejectDeleted,
} from '../lib/little-ramda'
import {taskViewStore} from './index'

@autobind
class Task {
  @observable id = `Task_${nanoid()}`

  @setter
  @observable
  title = ''

  @toggle('toggleDelete')
  @observable
  isDeleted = false

  @setter('markDone', true)
  @setter('markUnDone', false)
  @toggle('toggleDone')
  @observable
  isDone = false

  constructor(snapshot) {
    Object.assign(this, snapshot)
  }

  @computed
  get isSelected() {
    return taskViewStore.isTaskSelected(this)
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
    this.allTasks.unshift(new Task({title: fWord()}))
  }

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      //
      overProp('allTasks')(map(TaskConstructor)),
      mergeWith(defaultTo)({allTasks: []}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskStore
