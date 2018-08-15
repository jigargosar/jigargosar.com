import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'

class Task {
  id = `Task_${nanoid()}`
  name = fWord()
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
