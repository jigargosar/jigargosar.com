import {action, computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'
import {storage} from '../lib/storage'
import {defaultTo, pick, propOr} from '../lib/ramda'

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

  saveToLS() {
    console.debug(`saving snapshot`, this.toJS)
    storage.set('rootStore', this.toJS)
  }

  @action
  loadFromLS() {
    const snapshot = defaultTo({})(storage.get('rootStore'))
    console.log(`loading snapshot`, snapshot)
    this.applySnapshot(snapshot)
  }

  applySnapshot(snapshot) {
    Object.assign(this, pick(['title'])(snapshot))
    this.taskStore.applySnapshot(propOr('taskStore')(snapshot))
  }
}

export default RootStore
