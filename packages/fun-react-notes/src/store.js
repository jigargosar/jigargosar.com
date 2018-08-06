import RootStore from './RootStore'

const store = RootStore.create()

store.loadFromLS()
store.saveToLSOnSnapshotChange()

export default /*hotSnapshot(module)*/ store

if (module.hot) {
  // connectReduxDevtools(require('remotedev'), store)
  window.s = store
}
