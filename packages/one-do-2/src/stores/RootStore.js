import {action, computed, observable, toJS} from '../lib/mobx'
import {prettyStringifySafe} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import {storage} from '../lib/storage'
import {defaultTo, propOr, unless} from '../lib/exports-ramda'
import DebugStore from './DebugStore'
import {whenKeyPD, withKeyEvent} from '../lib/little-react'
import TaskViewStore from './TaskViewStore'
import {debugStore} from './index'
import {isTargetAnyInput} from '../lib/little-dom'
import {AddTaskViewStore} from './AddTaskViewStore'
import {taskStore} from './TaskStore'

@autobind
class RootStore {
  @observable.ref debugStore = new DebugStore()
  @observable.ref taskView = new TaskViewStore()
  @observable.ref addTaskView = new AddTaskViewStore()

  @computed
  get toPrettyJSON() {
    return prettyStringifySafe(this.toJS)
  }

  @computed
  get toJS() {
    return toJS(this)
  }

  @computed
  get snapshot() {
    return this.toJS
  }

  @computed
  get isFocusTrapPaused() {
    return debugStore.isInTransition || debugStore.isDebugViewOpen
  }

  saveToLS() {
    // console.debug(`[RS] saving snapshot`, this.toJS)
    storage.set('rootStore', this.snapshot)
  }

  @action
  resetLS() {
    this.applySnapshot({})
    taskStore.removeAll()
  }

  @action
  loadFromLS() {
    const snapshot = defaultTo({})(storage.get('rootStore'))
    console.debug(`[RS] loading snapshot`, snapshot)
    this.applySnapshot(snapshot)
  }

  @action
  applySnapshot(snapshot) {
    this.debugStore.applySnapshot(propOr({})('debugStore')(snapshot))
    this.taskView.applySnapshot(propOr({})('taskView')(snapshot))
  }

  @computed
  get onKeyDown() {
    const taskView = this.taskView
    const selectedTaskInvoker = taskView.selectedTaskInvoker
    const toggleDone = selectedTaskInvoker('updateToggleDone')
    const destroy = selectedTaskInvoker('destroy')
    const globalShortcuts = [
      whenKeyPD('`')(this.debugStore.toggleDebugView),
    ]
    const noDialogShortcuts = [
      whenKeyPD('down')(taskView.selectNextTask),
      whenKeyPD('up')(taskView.selectPrevTask),
      whenKeyPD('space')(toggleDone),
      whenKeyPD('x')(toggleDone),
      whenKeyPD('mod+right')(toggleDone),
      whenKeyPD('d')(destroy),
      whenKeyPD('q')(taskView.addNewTask),
    ]
    const shortcuts = debugStore.isDebugViewOpen ? [] : noDialogShortcuts
    return unless(isTargetAnyInput)(
      withKeyEvent(...globalShortcuts, ...shortcuts),
    )
  }
}

export default RootStore
