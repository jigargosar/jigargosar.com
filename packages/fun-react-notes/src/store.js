import RootStore from './RootStore'

const store = RootStore.create()

store.loadFromLS()
store.saveToLSOnSnapshotChange()

export default store

if (module.hot) {
  window.s = store
}
