import {action, computed, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {
  compose,
  defaultTo,
  is,
  mergeWith,
  propOr,
  unless,
} from '../lib/ramda'
import {
  findByIdOrHead,
  nextEl,
  overProp,
  prevEl,
} from '../lib/little-ramda'
import {taskStore} from './index'

function tryFocusDOMId(id) {
  const el = document.getElementById(id)
  if (el) {
    el.focus()
  } else {
    console.warn('[focus] id not found', id)
  }
}

@autobind
class TaskViewStore {
  @intercept(overProp('newValue')(unless(is(String))(propOr(null)('id'))))
  @setter('setSelectedTask')
  @observable
  selectedTaskId = null

  @observable lastSelectedTaskId = null

  @computed
  get selectedTask() {
    return findByIdOrHead(this.selectedTaskId, this.tasks)
  }

  @computed
  get tasks() {
    return taskStore.tasks
  }

  isTaskSelected({id}) {
    return this.selectedTaskId === id
  }

  selectedTaskInvoker(fnName) {
    return () => this.invokeOnSelectedTask(fnName)
  }

  @action
  unSelectTask(task) {
    if (this.isTaskSelected(task)) {
      this.setSelectedTask(null)
      this.lastSelectedTaskId = task.id
    }
  }
  @action
  selectNextTask() {
    this.navigateToTask(nextEl(this.selectedTask, this.tasks))
  }

  @action
  selectPrevTask() {
    this.navigateToTask(prevEl(this.selectedTask, this.tasks))
  }

  @action
  invokeOnSelectedTask(fnName) {
    const task = this.selectedTask
    if (task) {
      task[fnName]()
    }
  }

  @action
  navigateToTask(next) {
    this.setSelectedTask(next)
    this.tryFocusSelectedTask()
  }

  @action
  tryFocusSelectedTask() {
    const task = this.selectedTask
    if (task) {
      tryFocusDOMId(task.id)
    }
  }

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      // overProp('tasks')(map(TaskConstructor)),
      mergeWith(defaultTo)({
        selectedTaskId: null,
      }),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskViewStore
