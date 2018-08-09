import RootStore from './RootStore'
import {destroy} from './lib/little-mst'

const store = RootStore.create({}, {})

try {
  store.loadFromLS()
} catch (e) {
  console.log('[store] loadFromLS', e)
}
store.saveToLSOnSnapshotChange()

store.syncIfDirty()

export default /*hotSnapshot(module)*/ store

if (module.hot) {
  window.s = store
  window.store = store
  module.hot.dispose(() => {
    try {
      destroy(store)
    } catch (e) {
      console.log('[store] destroy on hot dispose', e)
    }
  })
}
