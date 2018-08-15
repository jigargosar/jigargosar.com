import {computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {merge, pick} from '../lib/ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'

@autobind
class RootStore {
  @observable title = 'One Do'
  @observable taskStore = null
  constructor() {
    this.taskStore = new TaskStore({root: this})
  }

  @computed
  get toJSON() {
    return prettyJSONStringify(this.toJSForLS)
  }

  @computed
  get toJS() {
    return toJS(this)
  }
  @computed
  get toJSForLS() {
    return merge(
      {taskStore: this.taskStore.toJSForLS},
      pick(['title'], this),
    )
  }
}

export default RootStore
