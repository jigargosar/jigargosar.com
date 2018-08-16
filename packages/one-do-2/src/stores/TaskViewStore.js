import {action, computed, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter, toggle} from '../lib/mobx-decorators'
import {
  ascend,
  compose,
  defaultTo,
  indexOf,
  is,
  mergeWith,
  pick,
  propOr,
  sortWith,
  unless,
} from '../lib/ramda'
import {
  eqById,
  filterDone,
  findById,
  findByIdOrHead,
  nextEl,
  overProp,
  prevEl,
  propIsDone,
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

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      // overProp('tasks')(map(TaskConstructor)),
      mergeWith(defaultTo)({
        selectedTaskId: null,
      }),
      pick(['selectedTaskId', 'lastSelectedTaskId']),
    )
    Object.assign(this, toObj(snapshot))
  }

  @toggle('toggleDoneGroup')
  @observable
  isDoneHidden = false

  disposers = Disposers(module)

  @computed
  get sortedTasks() {
    return sortWith([ascend(propIsDone)])(taskStore.tasks)
  }

  @computed
  get pendingTasks() {
    return rejectDone(this.sortedTasks)
  }
  @computed
  get pendingCount() {
    return this.pendingTasks.length
  }

  @computed
  get doneTasks() {
    return filterDone(this.sortedTasks)
  }

  @computed
  get doneCount() {
    return this.doneTasks.length
  }

  @computed
  get totalCount() {
    return this.pendingCount + this.doneCount
  }

  @computed
  get navigationTasks() {
    return [
      ...this.pendingTasks,
      ...(this.isDoneHidden ? [] : this.doneTasks),
    ]
  }

  @computed
  get selectedTask() {
    const tasks = this.navigationTasks
    return compose(
      defaultTo(findByIdOrHead(this.lastSelectedTaskId)(tasks)),
      findById(this.selectedTaskId),
    )(tasks)
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
  addNewTask() {
    const task = taskStore.addNewTask()
    this.setSelectedTask(task)
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
}

export default TaskViewStore
