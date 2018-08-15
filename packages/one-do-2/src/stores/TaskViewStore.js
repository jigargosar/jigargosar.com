import {action, computed, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {intercept, setter} from '../lib/mobx-decorators'
import {compose, defaultTo, mergeWith, propOr} from '../lib/ramda'
import {overProp} from '../lib/little-ramda'
import {taskStore} from './index'

@autobind
class TaskViewStore {
  @intercept(change => {
    console.log(`change`, change)
    return overProp('newValue')(propOr(null)('id'))(change)
  })
  @setter('setSelectedTask')
  @observable
  selectedTaskId = null

  @computed
  get selectedTask() {
    return taskStore.findById(this.selectedTaskId)
  }

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
