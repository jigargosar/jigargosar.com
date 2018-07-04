/*eslint-disable*/
import ow from 'ow'
import * as mu from 'mobx-utils/lib/mobx-utils'
import {createObservableObject, oObject} from './utils'
import {_} from '../utils'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
const nanostate = require('nanostate')
const R = require('ramda')
const validate = require('aproba')
const RA = require('ramda-adjunct')

/*eslint-enable*/

export const firestoreServerTimestamp = () =>
  firebase.firestore.FieldValue.serverTimestamp()

export const createFirestoreTimestamp = ({seconds, nanoseconds}) => {
  validate('NN', [seconds, nanoseconds])
  return new firebase.firestore.Timestamp(seconds, nanoseconds)
}

export const createFieldPath = path =>
  new firebase.firestore.FieldPath(...path.split('.'))

export const zeroFirestoreTimestamp = new firebase.firestore.Timestamp(
  0,
  0,
)

if (module.hot) {
  window.firebase = firebase
}
export const Fire = function() {
  if (!firebase.apps[0]) {
    const config = {
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
  const firestore = firebase.firestore()
  return oObject(
    {
      get userRef() {
        return createFirestoreUserRef(this.uid, firestore)
      },
      get store() {
        return createFirestore(firebase, this)
      },
      get uid() {
        return this.auth.uid
      },
      get auth() {
        return createFireAuth(firebase)
      },
    },
    {},
    {name: 'Fire'},
  )
}

function createFirestore(firebase, fire) {
  const getPathLength = _.compose(
    _.length,
    _.reject(_.isEmpty),
    _.split('/'),
  )
  const isCollectionPath = _.compose(RA.isOdd, getPathLength)
  const isDocumentPath = _.complement(isCollectionPath)

  const firestore = firebase.firestore()

  function getRefFromPath(path, firestore) {
    return isDocumentPath(path)
      ? firestore.doc(path)
      : firestore.collection(path)
  }

  return oObject({
    get userRef() {
      return createFirestoreUserRef(fire.auth.uid, firestore)
    },
    createUserCollectionRef(collectionName) {
      validate('S', arguments)
      return this.userRef.collection(collectionName)
    },
    get userDoc() {
      return mu.fromPromise(async resolve => {
        if (fire.auth.isSignedIn) {
          resolve(await this.userRef.get())
        }
      })
    },
    getFromUserPath(path) {
      return mu.fromPromise(async resolve => {
        if (fire.auth.isSignedIn) {
          resolve(
            await getRefFromPath(
              `/users/${fire.auth.uid}/${path}`,
              firestore,
            ).get(),
          )
        }
      })
    },
  })
}

function createFireAuth(firebase) {
  function signInWithRedirect() {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.setCustomParameters({prompt: 'select_account'})
    return firebase.auth().signInWithRedirect(provider)
  }
  function signInWithPopup() {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.setCustomParameters({prompt: 'select_account'})
    return firebase.auth().signInWithPopup(provider)
  }
  function signOut() {
    return firebase.auth().signOut()
  }

  const currentUser = firebase.auth().currentUser
  const fireAuth = createObservableObject({
    props: {
      _user: currentUser || null,
      _isAuthStateKnown: false,
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
        return this._isAuthStateKnown && !_.isNil(this._user)
      },
      get isSignedOut() {
        return this._isAuthStateKnown && _.isNil(this._user)
      },
      get isAuthKnown() {
        return this._isAuthStateKnown
      },
      signInWithRedirect,
      signOut,
      signInWithPopup,
    },
    actions: {
      _onFirebaseAuthStateChanged(user) {
        this._user = user
        this._isAuthStateKnown = true
      },
      _onAuthMachineStateEntered(authState) {
        this._authState = authState
      },
    },
    name: 'FireAuth',
  })

  firebase
    .auth()
    .onAuthStateChanged(fireAuth._onFirebaseAuthStateChanged)

  return fireAuth
}

function createFirestoreUserRef(uid, firestore) {
  validate('SO', arguments)
  ow(uid, ow.string.label('uid').nonEmpty)
  return firestore.doc(`/users/${uid}/`)
}
