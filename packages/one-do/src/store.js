import RootStore from './RootStore'

const syncAdapter = {
  syncItem(name, props) {
    // return Promise.resolve(props)
    return Promise.reject({msg: 'sync error', props})
  },
}
const store = RootStore.create({}, {syncAdapter})

store.loadFromLS()
store.saveToLSOnSnapshotChange()
store.sync()

export default /*hotSnapshot(module)*/ store

if (module.hot) {
  // connectReduxDevtools(require('remotedev'), store)
  window.s = store
}
