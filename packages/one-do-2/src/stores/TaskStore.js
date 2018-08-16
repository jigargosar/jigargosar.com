import {action, computed, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter, toggle} from 'mobx-decorators'
import {autobind} from '../lib/autobind'
import {compose, construct, defaultTo, map, mergeWith} from '../lib/ramda'
import {findById, overProp} from '../lib/little-ramda'
import {taskViewStore} from './index'

class Task {
  @observable id = `Task_${nanoid()}`

  @setter
  @observable
  title = ''

  @toggle('toggleDeleted')
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
  @observable tasks = []

  findById(id) {
    return findById(id)(this.tasks)
  }

  @action
  addNewTask() {
    this.tasks.unshift(new Task({title: fWord()}))
  }

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      //
      overProp('tasks')(map(TaskConstructor)),
      mergeWith(defaultTo)({tasks: []}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskStore
