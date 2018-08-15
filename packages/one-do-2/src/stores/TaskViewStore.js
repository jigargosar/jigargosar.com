import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {isNil, prop, unless} from '../lib/ramda'

@autobind
class TaskViewStore {
  @intercept(unless(isNil)(prop('id')))
  @setter('setSelectedTask')
  @observable
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
