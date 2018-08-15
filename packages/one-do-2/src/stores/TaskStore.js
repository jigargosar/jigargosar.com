import {action, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter, toggle} from 'mobx-decorators'
import {autobind} from '../lib/autobind'
import {compose, construct, map, merge} from '../lib/ramda'
import {overProp} from '../lib/little-ramda'

@autobind
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
}

const TaskConstructor = construct(Task)

@autobind
class TaskStore {
  @observable tasks = []

  @action
  addNewTask() {
    this.tasks.unshift(new Task({title: fWord()}))
  }

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      //
      overProp('tasks')(map(TaskConstructor)),
      merge({tasks: []}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskStore
