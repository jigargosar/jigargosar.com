import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {
  compose,
  defaultTo,
  isNil,
  mergeWith,
  prop,
  unless,
} from '../lib/ramda'

@autobind
class TaskViewStore {
  @intercept(unless(isNil)(prop('id')))
  @setter('setSelectedTask')
  @observable
  selectedTaskId = null

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      //
      // overProp('tasks')(map(TaskConstructor)),
      mergeWith(defaultTo)({selectedTaskId: null}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default TaskViewStore
