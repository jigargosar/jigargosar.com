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
import {overProp} from '../lib/little-ramda'
import {taskStore} from './index'

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

  @setter('openTaskMenu', true)
  @setter('closeTaskMenu', false)
  @observable
  isTaskMenuOpen = false

  @computed
  get selectedTask() {
    return taskStore.findById(this.selectedTaskId)
  }

  isTaskSelected({id}) {
    return this.selectedTaskId === id
  }

  isTaskMenuOpenFor(task) {
    return this.isTaskSelected(task) && this.isTaskMenuOpen
  }

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      //
      // overProp('tasks')(map(TaskConstructor)),
      mergeWith(defaultTo)({
        selectedTaskId: null,
        isTaskMenuOpen: false,
      }),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskViewStore
