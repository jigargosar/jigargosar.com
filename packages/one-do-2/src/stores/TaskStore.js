import {computed, observable, toJS} from '../lib/mobx'
import {prettyJSONStringify} from '../lib/little-ramda'
import {pick} from '../lib/ramda'
import {autobind} from '../lib/autobind'

@autobind
class TaskStore {
  @observable tasks = []
}

export default TaskStore
