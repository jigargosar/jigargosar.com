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
  omit,
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
  propIsDeleted,
  propIsDone,
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

  @toggle('toggleDeletedGroup')
  @observable
  isDeletedHidden = true

  @toggle('toggleDoneGroup')
  @observable
  isDoneHidden = true

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
  get sortedAllTasks() {
    return sortWith([ascend(propIsDeleted), ascend(propIsDone)])(
      taskStore.allTasks,
    )
  }

  @computed
  get navigationTasks() {
    return rejectDeleted(this.sortedAllTasks)
  }

  @computed
  get pendingTasks() {
    return rejectDone(rejectDeleted(this.navigationTasks))
  }

  @computed
  get doneTasks() {
    return filterDone(rejectDeleted(this.navigationTasks))
  }

  @computed
  get deletedTasks() {
    return taskStore.deletedTasks
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
