import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import {fromPromise, fromResource} from './lib/mobx-utils'
import {complement, identity} from './lib/ramda'

const app = (() => {
  if (firebase.apps[0]) {
    return firebase.apps[0]
  } else {
    const app = firebase.initializeApp({
      apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
      authDomain: 'not-now-142808.firebaseapp.com',
      databaseURL: 'https://not-now-142808.firebaseio.com',
      projectId: 'not-now-142808',
      storageBucket: 'not-now-142808.appspot.com',
      messagingSenderId: '476064436883',
    })

    app.firestore().settings({timestampsInSnapshots: true})
    app
      .firestore()
      .enablePersistence()
      .catch(console.error)

    return app
  }
})()

export function signInWithPopup() {
  const GoogleAuthProvider = firebase.auth.GoogleAuthProvider
  const authProvider = new GoogleAuthProvider()
  authProvider.setCustomParameters({prompt: 'select_account'})
  return app.auth().signInWithPopup(authProvider)
}

export const authState = fromPromise(resolve => {
  const listener = app.auth().onAuthStateChanged(() => {
    resolve()
    listener()
  })
})

const UNKNOWN = 'UNKNOWN'
const SIGNED_IN = 'SIGNED_IN'
const SIGNED_OUT = 'SIGNED_OUT'

export const userState = (() => {
  let disposer = identity
  return fromResource(
    sink => {
      disposer = app.auth().onAuthStateChanged(user => {
        sink({user, state: user ? SIGNED_IN : SIGNED_OUT})
      })
    },
    disposer,
    {user: null, state: UNKNOWN},
  )
})()

export const isUserStateUnknown = () => userState.state === UNKNOWN
export const isUserStateKnown = complement(isUserStateUnknown)
export const isSignedIn = () => userState.state === SIGNED_IN
export const isSignedOut = () => userState.state === SIGNED_OUT

const auth = app.auth()
export const getUser = () => auth.currentUser

export const firestore = app.firestore()

export const firestoreUsersCRef = firestore.collection('users')
export const firestoreUserRef = () => firestoreUsersCRef.doc(getUser().uid)

export const firestoreUserCRefNamed = name =>
  firestoreUserRef().collection(name)

if (module.hot) {
  window.f = firebase
}

export async function queryToDocsData(cRef) {
  const qs = await cRef.get()
  return qs.docs.map(qds => qds.data())
}
