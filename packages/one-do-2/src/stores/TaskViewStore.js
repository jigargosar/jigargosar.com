import {action, computed, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {
  __,
  compose,
  defaultTo,
  head,
  inc,
  is,
  mathMod,
  mergeWith,
  prop,
  propOr,
  unless,
} from '../lib/ramda'
import {findById, indexOfOrNaN, overProp} from '../lib/little-ramda'
import {taskStore} from './index'

function findByIdOrHead(id, list) {
  return compose(defaultTo(null), defaultTo(head(list)), findById(id))(
    list,
  )
}

function tryFocusDOMId(id) {
  const el = document.getElementById(id)
  if (el) {
    el.focus()
  } else {
    console.warn('[focus] id not found', id)
  }
}

function nextEl(el, list) {
  return compose(
    prop(__, list),
    mathMod(__, list.length),
    inc,
    indexOfOrNaN(el),
  )(list)
}

@autobind
class TaskViewStore {
  @intercept(overProp('newValue')(unless(is(String))(propOr(null)('id'))))
  @setter('setSelectedTask')
  @observable
  selectedTaskId = null

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

  @action
  selectNextTask() {
    const list = this.tasks
    const el = this.selectedTask
    const next = nextEl(el, list)

    this.setSelectedTask(next)
    if (next) {
      tryFocusDOMId(next.id)
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
