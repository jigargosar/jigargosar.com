import {action} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {allObservable, intercept, setter} from '../lib/mobx-decorators'
import {isNil, prop, unless} from '../lib/ramda'

@autobind
@allObservable
class TaskViewStore {
  @intercept(unless(isNil)(prop('id')))
  @setter('setSelectedTask')
  selectedTaskId = null

  @action
  applySnapshot(snapshot) {
    // const toObj = compose(
    //   //
    //   overProp('tasks')(map(TaskConstructor)),
    //   merge({tasks: []}),
    // )
    // Object.assign(this, toObj(snapshot))
  }
}

export default TaskViewStore
