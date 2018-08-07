import RootStore from './RootStore'
import delay from 'delay'
import {destroy} from './lib/little-mst'
import firebase from 'firebase/app'

const app =
  firebase.apps[0] ||
  firebase.initializeApp({
    apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
    authDomain: 'not-now-142808.firebaseapp.com',
    databaseURL: 'https://not-now-142808.firebaseio.com',
    projectId: 'not-now-142808',
    storageBucket: 'not-now-142808.appspot.com',
    messagingSenderId: '476064436883',
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
