import {observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'

@autobind
class TaskStore {
  @observable tasks = []
}

export default TaskStore
