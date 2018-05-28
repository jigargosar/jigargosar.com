const log = require('nanologger')('firebaseStore')
const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')

const createStore = require('./createStore')

var config = {
  apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
  authDomain: 'not-now-142808.firebaseapp.com',
  databaseURL: 'https://not-now-142808.firebaseio.com',
  projectId: 'not-now-142808',
  storageBucket: 'not-now-142808.appspot.com',
  messagingSenderId: '476064436883',
}

module.exports = createStore({
  namespace: 'firebase',
  initialState: {},
  events: {
    DOMContentLoaded: ({store, actions: {render}}) => {
      const app = firebase.initializeApp(config, 'choo-list')
      app.auth().onAuthStateChanged(user => {
        log.debug('onAuthStateChanged user:', user)
        store.user = user
        if (user) {
          app
            .firestore()
            .collection(`users/${user.uid}/grains`)
            .onSnapshot(snapshot => {
              log.debug('grains snapshot', snapshot)
            })
        }
        render()
      })
    },
  },
})
