import {action, computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'
import {storage} from '../lib/storage'
import {defaultTo, pick, propOr} from '../lib/ramda'
import DebugStore from './DebugStore'
import {whenKeyPD, withKeyEvent} from '../lib/little-react'

@autobind
class RootStore {
  @observable title = 'One Do'
  @observable taskStore = null
  @observable debugStore = null

  constructor() {
    this.taskStore = new TaskStore()
    this.debugStore = new DebugStore()
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
    console.debug(`[RS] saving snapshot`, this.toJS)
    storage.set('rootStore', this.toJS)
  }

  @action
  loadFromLS() {
    const snapshot = defaultTo({})(storage.get('rootStore'))
    console.debug(`[RS] loading snapshot`, snapshot)
    this.applySnapshot(snapshot)
  }

  @action
  applySnapshot(snapshot) {
    Object.assign(this, pick(['title'])(snapshot))
    this.taskStore.applySnapshot(propOr({})('taskStore')(snapshot))
    this.debugStore.applySnapshot(propOr({})('debugStore')(snapshot))
  }

  @computed
  get onKeyDown() {
    return withKeyEvent(
      //
      whenKeyPD('`')(() => this.debugStore.toggleDebugView()),
    )
  }
}

export default RootStore
