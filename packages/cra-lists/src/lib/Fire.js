// Foo

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
const firebase = require('firebase/app')
import nanostate from 'nanostate'
import * as R from 'ramda'
import RA from 'ramda-adjunct'
require('firebase/auth')
require('firebase/firestore')
/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export function initFirebase() {
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
  return firebase
}

function Fire() {
  const firebase = initFirebase()
  const auth = firebase.auth()
  return {
    firebase,
    auth,
  }
}

export function FireAuth(fire) {
  const authMachine = nanostate('unknown', {
    unknown: {ON_USER_NOT_NIL: 'signedIn', ON_USER_NIL: 'signedOut'},
    signedIn: {ON_USER_NIL: 'signedOut', ON_SIGNOUT: 'unknown'},
    signedOut: {ON_USER_NOT_NIL: 'signedIn', ON_SIGNIN: 'unknown'},
  })

  fire.auth.onAuthStateChanged(user => {
    authMachine.emit(
      R.isNil(user) ? 'ON_USER_NIL' : 'ON_USER_NOT_NIL',
    )
  })
  function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.setCustomParameters({prompt: 'select_account'})
    return firebase.auth().signInWithRedirect(provider)
  }
  function signOut() {
    return firebase.auth().signOut()
  }
  return {
    on: (eventName, listener) => {
      authMachine.on(eventName, listener)
      return () => authMachine.removeListener(listener)
    },
    get user() {
      return fire.auth.currentUser
    },
    get displayName() {
      return this.user.displayName
    },
    get state() {
      return authMachine.state
    },
    signIn,
    signOut,
  }
}
export default Fire
