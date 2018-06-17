import ow from 'ow/dist/index'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')
const R = require('ramda')
const m = require('mobx')
const validate = require('aproba')

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
  return m.observable(
    {
      createUserCollectionRef(collectionName) {
        validate('S', arguments)
        return createFirestoreUserCollection(
          collectionName,
          this.auth.uid,
          firebase.firestore(),
        )
      },
      get auth() {
        m.trace(true)
        return createFireAuth(firebase)
      },
    },
    {},
    {name: 'FirebaseService'},
  )
})()

function createFireAuth(firebase) {
  function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.setCustomParameters({prompt: 'select_account'})
    return firebase.auth().signInWithRedirect(provider)
  }
  function signOut() {
    return firebase.auth().signOut()
  }
  const authMachine = nanostate('unknown', {
    unknown: {ON_USER_NOT_NIL: 'signedIn', ON_USER_NIL: 'signedOut'},
    signedIn: {ON_USER_NIL: 'signedOut', ON_SIGNOUT: 'unknown'},
    signedOut: {ON_USER_NOT_NIL: 'signedIn', ON_SIGNIN: 'unknown'},
  })

  const fireAuth = m.observable(
    {
      _user: null,
      _authState: authMachine.state,
      _onFirebaseAuthStateChanged(user) {
        this._user = user
      },
      _onAuthMachineStateEntered(authState) {
        this._authState = authState
      },
      get uid() {
        const user = this._user
        ow(user, ow.object.label('user').hasKeys('uid'))
        ow(user.uid, ow.string.label('uid').nonEmpty)
        return user.uid
      },
      get displayName() {
        const user = this._user
        ow(user, ow.object.label('user').hasKeys('displayName'))
        return user.displayName
      },
      get isSignedIn() {
        return R.equals(this._authState, 'signedIn')
      },
      get isAuthKnown() {
        return !R.equals(this._authState, 'unknown')
      },
      signIn,
      signOut,
    },
    {
      _user: m.observable.ref,
      _authState: m.observable.ref,
      _onAuthMachineStateEntered: m.action.bound,
      _onFirebaseAuthStateChanged: m.action.bound,
    },
    {name: 'FireAuth'},
  )
  // m.runInAction(() => (fireAuth._authState = authMachine.state))
  authMachine.on('*', fireAuth._onAuthMachineStateEntered)

  firebase.auth().onAuthStateChanged(user => {
    fireAuth._onFirebaseAuthStateChanged(user)

    authMachine.emit(
      R.isNil(user) ? 'ON_USER_NIL' : 'ON_USER_NOT_NIL',
    )
  })
  return fireAuth
}

function createFirestoreUserCollection(
  collectionName,
  uid,
  firestore,
) {
  validate('SSO', arguments)
  ow(uid, ow.string.label('uid').nonEmpty)
  return firestore.collection(`/users/${uid}/${collectionName}/`)
}
