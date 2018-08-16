import {action, computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'
import {storage} from '../lib/storage'
import {defaultTo, propOr, unless} from '../lib/ramda'
import DebugStore from './DebugStore'
import {whenKeyPD, withKeyEvent} from '../lib/little-react'
import TaskViewStore from './TaskViewStore'
import {debugStore} from './index'
import {isTargetButton} from '../lib/little-dom'

@autobind
class RootStore {
  @observable.ref taskStore = new TaskStore()
  @observable.ref debugStore = new DebugStore()
  @observable.ref taskView = new TaskViewStore()

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
    this.taskView.applySnapshot(propOr({})('taskView')(snapshot))
  }

  @computed
  get onKeyDown() {
    const taskView = this.taskView
    const selectedTaskInvoker = taskView.selectedTaskInvoker
    const toggleDone = selectedTaskInvoker('toggleDone')
    const toggleDelete = selectedTaskInvoker('toggleDelete')
    const globalShortcuts = [
      whenKeyPD('`')(this.debugStore.toggleDebugView),
    ]
    const noDialogShortcuts = [
      whenKeyPD('down')(taskView.selectNextTask),
      whenKeyPD('up')(taskView.selectPrevTask),
      whenKeyPD('space')(toggleDone),
      whenKeyPD('x')(toggleDone),
      whenKeyPD('mod+right')(toggleDone),
      whenKeyPD('d')(toggleDelete),
      whenKeyPD('q')(taskView.addNewTask),
    ]
    const shortcuts = debugStore.isDebugViewOpen ? [] : noDialogShortcuts
    return unless(isTargetButton)(
      withKeyEvent(...globalShortcuts, ...shortcuts),
    )
  }
}

export default RootStore
