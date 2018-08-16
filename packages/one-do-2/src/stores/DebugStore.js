import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {compose, defaultTo, mergeWith} from '../lib/ramda'
import {toggle} from 'mobx-decorators'
import {observe, setter} from '../lib/mobx-decorators'

const logNewValue = observe(change => {
  const {type, object, oldValue, newValue} = change
  console.log(`[${type}] ${object.name} ${oldValue} -> ${newValue}`)
  console.debug(change)
})

@autobind
class DebugStore {
  @toggle('toggleDebugView')
  @observable
  isDebugViewOpen = false

  @logNewValue
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
