import {autobind} from '../lib/autobind'
import {action, observable} from '../lib/mobx'

@autobind
export class AddTaskViewStore {
  @observable title = ''

  @action
  onTitleChange(e) {
    this.title = e.target.value
  }
}
