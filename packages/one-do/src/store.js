import RootStore from './RootStore'
import {destroy} from './lib/little-mst'
import {
  authState,
  firestoreUserCRefNamed,
  isSignedOut,
  signInWithPopup,
} from './firebase'

authState.then(async () => {
  if (isSignedOut()) {
    await signInWithPopup()
  }
  const cRef = await firestoreUserCRefNamed('todos')
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
