import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {nanoid} from '../lib/nanoid'

class Task {
  id = `Task_${nanoid()}`
}

@autobind
class TaskStore {
  @observable tasks = []

  @action
  addTask() {
    this.tasks.unshift(new Task())
  }
}

export default TaskStore
