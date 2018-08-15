import {action, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter} from 'mobx-decorators'
import {autobind} from '../lib/autobind'

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
  @observable root

  constructor({root}) {
    this.root = root
  }

  @action
  addNewTask() {
    this.tasks.unshift(new Task())
  }
}

export default TaskStore
