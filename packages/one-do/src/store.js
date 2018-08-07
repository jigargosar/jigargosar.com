import RootStore from './RootStore'
import {destroy} from './lib/little-mst'
import {authState, isSignedOut, signInWithPopup} from './firebase'

authState.then(() => {
  if (isSignedOut()) {
    signInWithPopup()
  }
})

const store = RootStore.create({}, {})

store.loadFromLS()
store.saveToLSOnSnapshotChange()

export default /*hotSnapshot(module)*/ store

if (module.hot) {
  window.s = store
  module.hot.dispose(() => {
    destroy(store)
  })
}
