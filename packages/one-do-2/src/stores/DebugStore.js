import {action, observable} from '../lib/mobx'
import {autobind} from '../lib/autobind'
import {compose, defaultTo, mergeWith} from '../lib/exports-ramda'
import {setObservableProp, toggleObservableProp} from '../lib/little-mobx'

@autobind
class DebugStore {
  @observable isDebugViewOpen = false

  @observable isInTransition = false

  @action
  toggleDebugView() {
    toggleObservableProp('isDebugViewOpen', this)
  }

  @action
  onEnter() {
    setObservableProp('isInTransition', true, this)
  }

  @action
  onExited() {
    setObservableProp('isInTransition', false, this)
  }

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
