import {action, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter} from 'mobx-decorators'
import {autobind} from '../lib/autobind'
import {compose, construct, defaultTo, map, pick} from '../lib/ramda'
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
}

@autobind
class TaskStore {
  @observable tasks = []

  @action
  addNewTask() {
    this.tasks.unshift(new Task())
  }

  @action
  applySnapshot(snapshot) {
    const TaskConstructor = construct(Task)
    const toObj = compose(
      //
      overProp('tasks')(map(TaskConstructor)(defaultTo([]))),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskStore
