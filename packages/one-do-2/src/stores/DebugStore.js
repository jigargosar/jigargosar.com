import {action, computed, observable, toJS} from '../lib/mobx'
import {overProp, prettyJSONStringify} from '../lib/little-ramda'
import {autobind} from '../lib/autobind'
import TaskStore from './TaskStore'
import {storage} from '../lib/storage'
import {compose, defaultTo, merge, pick, propOr} from '../lib/ramda'
import {toggle} from 'mobx-decorators'

@autobind
class DebugStore {
  @toggle
  @observable
  isDebugViewOpen = false

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      //
      merge({isDebugViewOpen: false}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default DebugStore
