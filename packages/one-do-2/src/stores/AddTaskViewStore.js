import {autobind} from '../lib/autobind'
import {action, observable} from '../lib/mobx'
import {taskView} from './index'
import {isEmpty, pick} from '../lib/exports-ramda'
import {tryFocusDOMId} from '../lib/little-dom'

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

  @action
  addTaskAndKeepAdding() {
    this.addTask()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tryFocusDOMId('add-task-input')
      })
    })
  }
}
