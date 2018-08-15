import {action, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter} from 'mobx-decorators'
import {autobind} from '../lib/autobind'
import {compose, construct, map, merge} from '../lib/ramda'
import {overProp} from '../lib/little-ramda'

@autobind
class Task {
  @observable id = `Task_${nanoid()}`

  @setter
  @observable
  title = fWord()

  @setter
  @observable
  isDeleted = false

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
    this.tasks.unshift(new Task())
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
