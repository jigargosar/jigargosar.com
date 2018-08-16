import {action, computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'
import {storage} from '../lib/storage'
import {defaultTo, propOr} from '../lib/ramda'
import DebugStore from './DebugStore'
import {whenKeyPD, withKeyEvent} from '../lib/little-react'
import TaskViewStore from './TaskViewStore'
import {debugStore} from './index'

@autobind
class RootStore {
  @observable.ref taskStore = new TaskStore()
  @observable.ref debugStore = new DebugStore()
  @observable.ref taskViewStore = new TaskViewStore()

  @computed
  get toJSON() {
    return prettyJSONStringify(this.toJS)
  }

  @computed
  get toJS() {
    return toJS(this)
  }

  @computed
  get isFocusTrapPaused() {
    return debugStore.isInTransition || debugStore.isDebugViewOpen
  }

  saveToLS() {
    // console.debug(`[RS] saving snapshot`, this.toJS)
    storage.set('rootStore', this.toJS)
  }

  @action
  resetLS() {
    this.applySnapshot({})
  }

  @action
  loadFromLS() {
    const snapshot = defaultTo({})(storage.get('rootStore'))
    console.debug(`[RS] loading snapshot`, snapshot)
    this.applySnapshot(snapshot)
  }

  @action
  applySnapshot(snapshot) {
    this.taskStore.applySnapshot(propOr({})('taskStore')(snapshot))
    this.debugStore.applySnapshot(propOr({})('debugStore')(snapshot))
    this.taskViewStore.applySnapshot(propOr({})('taskViewStore')(snapshot))
  }

  @computed
  get onKeyDown() {
    const toggleDone = this.taskViewStore.selectedTaskInvoker('toggleDone')
    const noDialogShortcuts = [
      whenKeyPD('`')(this.debugStore.toggleDebugView),
      whenKeyPD('down')(this.taskViewStore.selectNextTask),
      whenKeyPD('up')(this.taskViewStore.selectPrevTask),
      whenKeyPD('space')(toggleDone),
      whenKeyPD('x')(toggleDone),
      whenKeyPD('mod+right')(toggleDone),
    ]
    const shortcuts = debugStore.isDebugViewOpen ? [] : noDialogShortcuts
    return withKeyEvent(...shortcuts)
  }
}

export default RootStore
