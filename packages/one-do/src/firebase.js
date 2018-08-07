import firebase from 'firebase/app'
import 'firebase/auth'

const app =
  firebase.apps[0] ||
  firebase.initializeApp({
    apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
    authDomain: 'not-now-142808.firebaseapp.com',
    databaseURL: 'https://not-now-142808.firebaseio.com',
    projectId: 'not-now-142808',
    storageBucket: 'not-now-142808.appspot.com',
    messagingSenderId: '476064436883',
  })

export function signInWithPopup() {
  const GoogleAuthProvider = firebase.auth.GoogleAuthProvider
  const authProvider = new GoogleAuthProvider()
  authProvider.setCustomParameters({prompt: 'select_account'})
  return app.auth().signInWithPopup(authProvider)
}

export const authState = new Promise(resolve => {
  const listener = app.auth().onAuthStateChanged(() => {
    resolve()
    listener()
  })
})

const auth = app.auth()
export const getUser = () => auth.currentUser
export const isSignedIn = () => !!getUser()
export const isSignedOut = () => !isSignedIn()
