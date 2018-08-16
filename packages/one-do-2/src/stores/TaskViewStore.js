import {action, computed, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {
  compose,
  defaultTo,
  indexOf,
  is,
  mergeWith,
  omit,
  propOr,
  unless,
} from '../lib/ramda'
import {
  eqById,
  filterDeleted,
  filterDone,
  findById,
  findByIdOrHead,
  nextEl,
  overProp,
  prevEl,
  rejectDeleted,
  rejectDone,
} from '../lib/little-ramda'
import {taskStore} from './index'
import {Disposers} from '../lib/little-mobx'

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

  disposers = Disposers(module)

  @computed
  get selectedTask() {
    const tasks = this.navigationTasks
    return compose(
      defaultTo(findByIdOrHead(this.lastSelectedTaskId)(tasks)),
      findById(this.selectedTaskId),
    )(tasks)
  }

  @computed
  get navigationTasks() {
    return [...this.pendingTasks, ...this.doneTasks, ...this.deletedTasks]
  }

  @computed
  get unDeletedTasks() {
    return rejectDeleted(taskStore.tasks)
  }

  @computed
  get pendingTasks() {
    return rejectDone(this.unDeletedTasks)
  }

  @computed
  get doneTasks() {
    return filterDone(this.unDeletedTasks)
  }

  @computed
  get deletedTasks() {
    return filterDeleted(taskStore.tasks)
  }

  isTaskSelected(task) {
    return eqById(this.selectedTask)(task)
  }

  selectedTaskInvoker(fnName) {
    return () => this.invokeOnSelectedTask(fnName)
  }

  getFocusManagerAutoRunner() {
    let lastIdx = NaN
    return () => {
      const newIdx = indexOf(this.selectedTask)(this.navigationTasks)
      if (lastIdx !== newIdx && this.selectedTask) {
        requestAnimationFrame(() => this.tryFocusSelectedTask())
      }
    }
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
    this.navigateToTask(nextEl(this.selectedTask, this.navigationTasks))
  }

  @action
  selectPrevTask() {
    this.navigateToTask(prevEl(this.selectedTask, this.navigationTasks))
  }

  @action
  invokeOnSelectedTask(fnName) {
    if (this.selectedTask) {
      this.selectedTask[fnName]()
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
      omit(['disposers']),
      // overProp('tasks')(map(TaskConstructor)),
      mergeWith(defaultTo)({
        selectedTaskId: null,
      }),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskViewStore
