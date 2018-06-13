import nanoid from 'nanoid'
import {PouchService} from './PouchService'
import {SF} from '../safe-fun'
import {configure, observable, runInAction} from 'mobx'
import {getAppActorId} from '../LocalStorage'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')

export const FirebaseStore = (function() {
  if (!firebase.apps[0]) {
    var config = {
      apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
      authDomain: 'not-now-142808.firebaseapp.com',
      databaseURL: 'https://not-now-142808.firebaseio.com',
      projectId: 'not-now-142808',
      storageBucket: 'not-now-142808.appspot.com',
      messagingSenderId: '476064436883',
    }
    firebase.initializeApp(config)
    firebase.firestore().settings({timestampsInSnapshots: true})
    firebase
      .firestore()
      .enablePersistence()
      .catch(error =>
        log.trace('store enablePersistence result', error),
      )
  }
  const fireStore = observable(
    {
      user: null,
    },
    {user: observable.ref},
    {name: 'FirebaseStore'},
  )
  firebase
    .auth()
    .onAuthStateChanged(user =>
      runInAction(() => (fireStore.user = user)),
    )
  return fireStore
})()
