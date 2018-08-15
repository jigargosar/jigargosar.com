import {action, computed, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {
  compose,
  defaultTo,
  head,
  indexOf,
  is,
  mergeWith,
  propOr,
  unless,
} from '../lib/ramda'
import {findById, overProp} from '../lib/little-ramda'
import {taskStore} from './index'
import {compose, defaultTo, head} from 'ramda'

function findByIdOrHead(id, list) {
  return compose(defaultTo(null), defaultTo(head(list)), findById(id))(
    list,
  )
}

@autobind
class TaskViewStore {
  @intercept(change => {
    console.debug(`change`, change)
    return overProp('newValue')(unless(is(String))(propOr(null)('id')))(
      change,
    )
  })
  @setter('setSelectedTask')
  @observable
  selectedTaskId = null

  @computed
  get selectedTask() {
    const id = this.selectedTaskId
    const list = this.tasks
    return findByIdOrHead(id, list)
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
    const idx = indexOf(this.selectedTaskId)(this.tasks)
    this.setSelectedTask()(this.tasks)
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
