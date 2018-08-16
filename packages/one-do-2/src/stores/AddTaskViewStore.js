import {autobind} from '../lib/autobind'
import {observable} from '../lib/mobx'

@autobind
export class AddTaskViewStore {
  @observable title = ''

  @action()
  onTitleChange(e) {
    this.title = e.target.value
  }
}
