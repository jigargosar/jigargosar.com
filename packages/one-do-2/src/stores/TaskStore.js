import {action, computed, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {setter} from 'mobx-decorators'
import {autobind} from '../lib/autobind'
import {merge, pick} from '../lib/ramda'

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

  @computed
  get toJSForLS() {
    return merge({}, pick(['tasks'], this))
  }
}

export default TaskStore
