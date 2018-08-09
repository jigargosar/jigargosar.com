import RootStore from './RootStore'
import {destroy} from './lib/little-mst'

const store = RootStore.create({}, {})

store.loadFromLS()
store.saveToLSOnSnapshotChange()

store.sync()

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
