import RootStore from './RootStore'
import delay from 'delay'
import {destroy} from './lib/little-mst'
import {authState, isSignedOut, signInWithPopup} from './firebase'

authState.then(() => {
  if (isSignedOut()) {
    signInWithPopup()
  }
})

const syncAdapter = {
  syncItem(name, props) {
    // return Promise.resolve(props)
    return Math.random() > 0.4
      ? delay.reject(5000, {
          msg: 'sync error',
          props,
        })
      : Promise.resolve({props})
  },
}

const store = RootStore.create({}, {syncAdapter})

store.loadFromLS()
store.saveToLSOnSnapshotChange()

export default /*hotSnapshot(module)*/ store

if (module.hot) {
  window.s = store
  module.hot.dispose(() => {
    destroy(store)
  })
}
