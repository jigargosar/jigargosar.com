import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {compose, defaultTo, mergeWith} from '../lib/ramda'
import {toggle} from 'mobx-decorators'

@autobind
class DebugStore {
  @toggle('toggleDebugView')
  @observable
  isDebugViewOpen = false

  @action
  applySnapshot(snapshot) {
    const toObj = compose(
      //
      mergeWith(defaultTo)({isDebugViewOpen: false}),
    )
    Object.assign(this, toObj(snapshot))
  }
}

export default DebugStore
