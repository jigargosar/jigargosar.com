const {grainsPD} = require('../state')
const R = require('ramda')
const RA = require('ramda-adjunct')
const log = require('nanologger')('firebaseAppStore')
const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
const assert = require('assert')

var config = {
  apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
  authDomain: 'not-now-142808.firebaseapp.com',
  databaseURL: 'https://not-now-142808.firebaseio.com',
  projectId: 'not-now-142808',
  storageBucket: 'not-now-142808.appspot.com',
  messagingSenderId: '476064436883',
}

module.exports = function firebaseAppStore(state, emitter, app) {
  state.firebaseApp = null
  state.events.firebase_app_ready = 'firebase:app:ready'

  emitter.on(state.events.DOMCONTENTLOADED, () => {
    const firebaseApp = firebase.initializeApp(config)
    const firestore = firebaseApp.firestore()
    firestore.settings({timestampsInSnapshots: true})
    state.firebaseApp = firebaseApp
    state.firestore = firestore
    emitter.emit(state.events.firebase_app_ready)
  })
}
