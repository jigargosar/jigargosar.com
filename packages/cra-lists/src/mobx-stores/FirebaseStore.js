import {observable, runInAction} from 'mobx'
import ow from 'ow'

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
        console.warn('store enablePersistence result', error),
      )
  }
  const firebaseStore = observable(
    {
      user: null,
      get uid() {
        ow(this.user, ow.object.nonEmpty)
        return this.user.uid
      },
      getUserCollectionRef(cName) {
        return firebase
          .firestore()
          .collection(`/users/${this.uid}/${cName}/`)
      },
    },
    {user: observable.ref},
    {name: 'FirebaseStore'},
  )
  firebase
    .auth()
    .onAuthStateChanged(user =>
      runInAction(() => (firebaseStore.user = user)),
    )
  return firebaseStore
})()
