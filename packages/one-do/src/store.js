import RootStore from './RootStore'

const store = RootStore.create({}, {})

try {
  store.loadFromLS()
} catch (e) {
  console.log('[store] loadFromLS', e)
}
const disposer = store.saveToLSOnSnapshotChange()

// store.syncIfDirty()
store.startRemoteSync()

export default /*hotSnapshot(module)*/ store

if (module.hot) {
  window.s = store
  window.store = store
  module.hot.dispose(() => {
    try {
      disposer()
    } catch (e) {
      console.log('[store] destroy/dispose on hot dispose', e)
    }
  })
}
