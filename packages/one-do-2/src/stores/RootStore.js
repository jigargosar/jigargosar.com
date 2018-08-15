import {action, computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'
import {storage} from '../lib/storage'

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

  @action
  saveToLS() {
    storage.set('rootStore', this.toJSON)
  }
}

export default RootStore
