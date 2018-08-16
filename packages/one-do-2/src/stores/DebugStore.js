import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {compose, defaultTo, mergeWith, partial, prop} from '../lib/ramda'
import {toggle} from 'mobx-decorators'
import {observe, setter} from '../lib/mobx-decorators'

@autobind
class DebugStore {
  @toggle('toggleDebugView')
  @observable
  isDebugViewOpen = false

  @observe(
    compose(partial(console.log, ['inTransition']), prop('newValue')),
  )
  @setter('onEnter', true)
  @setter('onExited', false)
  @observable
  isInTransition = false

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
