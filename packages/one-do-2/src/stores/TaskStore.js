import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter} from 'mobx-decorators'

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
}

export default TaskStore
