import {computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {pick} from '../lib/ramda'
import {autobind} from '../lib/autobind'

@autobind
class RootStore {
  @observable title = 'One Do'

  constructor(stores) {
    this.tasks = stores.tasksStore
  }

  @computed
  get toJSON() {
    return prettyJSONStringify(this.toJS)
  }

  @computed
  get toJS() {
    return toJS(this)
  }
  @computed
  get toJSForLS() {
    return pick(['title'], toJS(this))
  }
}

export default RootStore
