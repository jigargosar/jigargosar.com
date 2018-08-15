import {computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'

@autobind
class RootStore {
  @observable title = 'One Do'
  @observable taskStore = null
  constructor() {
    this.taskStore = new TaskStore()
  }

  @computed
  get toJSON() {
    return prettyJSONStringify(this.toJS)
  }

  @computed
  get toJS() {
    return toJS(this)
  }
}

export default RootStore
