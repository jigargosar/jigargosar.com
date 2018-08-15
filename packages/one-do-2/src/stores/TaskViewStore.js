import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {
  compose,
  defaultTo,
  isNil,
  mergeWith,
  prop,
  propOr,
  unless,
} from '../lib/ramda'
import {overProp} from '../lib/little-ramda'

@autobind
class TaskViewStore {
  @intercept(change => {
    console.log(`change`, change)
    return overProp('newValue')(propOr(null)('id'))(change)
  })
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
