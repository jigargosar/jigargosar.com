import {State} from './State'
import {getAppActorId} from './LocalStorage'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')

const mst = require('mobx-state-tree')
var firebaseConfig = {
  apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
  authDomain: 'not-now-142808.firebaseapp.com',
  databaseURL: 'https://not-now-142808.firebaseio.com',
  projectId: 'not-now-142808',
  storageBucket: 'not-now-142808.appspot.com',
  messagingSenderId: '476064436883',
}

export const state = State.create(
  {},
  {localAppActorId: getAppActorId(), firebase, firebaseConfig},
)

mst.addMiddleware(state, (call, next) => {
  // console.log('in here', call)
  // loggedActions.unshift({ name: call.name, args: call.args });
  next(call)
})

if (module.hot) {
  window.state = state
  if (module.hot.data && module.hot.data.snapshot) {
    mst.applySnapshot(state, module.hot.data.snapshot)
  }
  module.hot.dispose(data => {
    console.clear()
    console.clear()
    data.snapshot = mst.getSnapshot(state)
    mst.destroy(state)
  })
}
