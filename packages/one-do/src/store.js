import RootStore from './RootStore'
import delay from 'delay'

const syncAdapter = {
  syncItem(name, props) {
    // return Promise.resolve(props)
    return Math.random() > 0.4
      ? delay.reject(2000, {
          msg: 'sync error',
          props,
        })
      : Promise.resolve(props)
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
