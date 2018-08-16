import {autobind} from '../lib/autobind'
import {action, observable} from '../lib/mobx'
import {taskView} from './index'
import {isEmpty, pick} from '../lib/ramda'

@autobind
export class AddTaskViewStore {
  @observable title = ''

  @action
  onTitleChange(e) {
    this.title = e.target.value
  }

  @action
  addTask() {
    if (isEmpty(this.title)) return
    taskView.addTask(pick(['title'])(this))
    this.title = ''
  }
}
