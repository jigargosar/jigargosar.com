import RootStore from './RootStore'
import delay from 'delay'
import pForever from 'p-forever'

const syncAdapter = {
  syncItem(name, props) {
    // return Promise.resolve(props)
    return Math.random() > 0.4
      ? delay.reject(5000, {
          msg: 'sync error',
          props,
        })
      : Promise.resolve(props)
  },
}

const store = RootStore.create({}, {syncAdapter})

store.loadFromLS()
store.saveToLSOnSnapshotChange()

pForever(async () => {
  await delay(500)
  return store.sync()
})

export default /*hotSnapshot(module)*/ store

if (module.hot) {
  // connectReduxDevtools(require('remotedev'), store)
  window.s = store
}
