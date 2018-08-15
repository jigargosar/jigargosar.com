import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {compose, merge} from '../lib/ramda'
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
