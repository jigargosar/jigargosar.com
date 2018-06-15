import {action, observable} from 'mobx'
import ow from 'ow'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')

export const FirebaseService = (function() {
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
      .catch(error => console.info('enablePersistenceFailed'))
  }
  const firebaseStore = observable(
    {
      user: null,
      get uid() {
        ow(this.user, ow.object.nonEmpty)
        return this.user.uid
      },
      createUserCollectionRef(cName) {
        return firebase
          .firestore()
          .collection(`/users/${this.uid}/${cName}/`)
      },
      onAuthStateChanged(user) {
        this.user = user
      },
      signIn() {
        const provider = new firebase.auth.GoogleAuthProvider()
        provider.setCustomParameters({prompt: 'select_account'})
        return firebase.auth().signInWithRedirect(provider)
      },
      signOut() {
        return firebase.auth().signOut()
      },
    },
    {user: observable.ref, onAuthStateChanged: action.bound},
    {name: 'FirebaseService'},
  )
  firebase.auth().onAuthStateChanged(firebaseStore.onAuthStateChanged)
  return firebaseStore
})()
