import {action, computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'
import {storage} from '../lib/storage'
import {
  compose,
  defaultTo,
  endsWith,
  nthArg,
  pickBy,
  propOr,
} from '../lib/ramda'
import DebugStore from './DebugStore'
import {
  logPersistEvent,
  whenKeyPD,
  withKeyEvent,
} from '../lib/little-react'
import TaskViewStore from './TaskViewStore'
import {debugStore} from './index'

@autobind
class RootStore {
  @observable.ref taskStore = new TaskStore()
  @observable.ref debugStore = new DebugStore()
  @observable.ref taskViewStore = new TaskViewStore()

  @computed
  get stores() {
    return pickBy(compose(endsWith('Store'), nthArg(1)))(this)
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
    const selectedTaskInvoker = this.taskViewStore.selectedTaskInvoker
    const toggleDone = selectedTaskInvoker('toggleDone')
    const toggleDelete = selectedTaskInvoker('toggleDelete')
    const globalShortcuts = [
      whenKeyPD('`')(this.debugStore.toggleDebugView),
    ]
    const noDialogShortcuts = [
      whenKeyPD('down')(this.taskViewStore.selectNextTask),
      whenKeyPD('up')(this.taskViewStore.selectPrevTask),
      whenKeyPD('space')(toggleDone),
      whenKeyPD('x')(toggleDone),
      whenKeyPD('mod+right')(toggleDone),
      whenKeyPD('d')(toggleDelete),
    ]
    const shortcuts = debugStore.isDebugViewOpen ? [] : noDialogShortcuts
    return e => {
      if (e.defaultPrevented) return e
      console.log(`e`, e)
      return withKeyEvent(...globalShortcuts, ...shortcuts)(e)
    }
  }
}

export default RootStore
