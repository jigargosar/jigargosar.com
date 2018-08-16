import {action, computed, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {
  compose,
  defaultTo,
  identity,
  is,
  mergeWith,
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
    return compose(
      defaultTo(findByIdOrHead(this.lastSelectedTaskId)(this.tasks)),
      findById(this.selectedTaskId),
    )(this.tasks)
  }

  @computed
  get tasks() {
    return rejectDeleted(taskStore.tasks)
  }

  @computed
  get pendingTasks() {
    return rejectDone(this.tasks)
  }

  @computed
  get doneTasks() {
    return filterDone(this.tasks)
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
    const fn = propOr(identity)(fnName)(this.selectedTask)
    fn()
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
