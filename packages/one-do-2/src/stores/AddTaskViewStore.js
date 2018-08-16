import {autobind} from '../lib/autobind'
import {action, observable} from '../lib/mobx'
import {taskView} from './index'
import {pick} from '../lib/ramda'

@autobind
export class AddTaskViewStore {
  @observable title = ''

  @action
  onTitleChange(e) {
    this.title = e.target.value
  }

  @action
  addTask() {
    taskView.addTask(pick(['title']))
    this.title = ''
  }
}
