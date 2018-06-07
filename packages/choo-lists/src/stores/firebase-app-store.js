const R = require('ramda')
const RA = require('ramda-adjunct')
const log = require('nanologger')('firebaseAppStore')
const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
const assert = require('assert')
const pReflect = require('p-reflect')

var config = {
  apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
  authDomain: 'not-now-142808.firebaseapp.com',
  databaseURL: 'https://not-now-142808.firebaseio.com',
  projectId: 'not-now-142808',
  storageBucket: 'not-now-142808.appspot.com',
  messagingSenderId: '476064436883',
}

module.exports = function firebaseAppStore(state, emitter) {
  state.firebaseApp = null
  state.firebaseAuth = null
  state.firestore = null
  state.events.firebase_app_ready = 'firebase:app:ready'

  emitter.on(state.events.DOMCONTENTLOADED, async () => {
    const firebaseApp = firebase.initializeApp(config)
    const firestore = firebaseApp.firestore()
    firestore.settings({timestampsInSnapshots: true})
    const result = await pReflect(firestore.enablePersistence())
    log.debug('firestore persistence result', result)
    state.firebaseApp = firebaseApp
    state.firebaseAuth = firebaseApp.auth()
    state.firestore = firestore
    emitter.emit(state.events.firebase_app_ready)
  })
}
