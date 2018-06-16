import ow from 'ow/dist/index'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')
const R = require('ramda')
const m = require('mobx')
const validate = require('aproba')
const RA = require('ramda-adjunct')

function wrapInValidateAccessProxy(obj, options) {
  m.observe(obj, change => {
    debugger
  })
  return new Proxy(obj, {
    get(target, property, receiver) {
      const shouldValidate =
        RA.isString(property) &&
        !['isMobXComputedValue', '_reactFragment'].includes(property)
      const isInvalid = !ow.isValid(
        target,
        ow.object.hasKeys(property),
      )
      if (shouldValidate && isInvalid) {
        console.warn(
          `Accessing non existent property ["${property}"] of `,
          target,
          options,
        )
        return new Error('Boom!!')
      }
      return Reflect.get(...arguments)
    },
  })
}

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
  const fireAuth = createFireAuth(firebase)
  return wrapInValidateAccessProxy(
    m.observable(
      {
        createUserCollectionRef(collectionName) {
          validate('S', arguments)
          validate('S', arguments)
          return createFirestoreUserCollection(
            collectionName,
            fireAuth.uid,
            firebase.firestore(),
          )
        },
        signIn() {
          return fireAuth.signIn()
        },
        signOut() {
          return fireAuth.signOut()
        },
        get a() {
          return fireAuth
        },
      },
      {},
      {name: 'FirebaseService'},
    ),
    {name: 'FirebaseService'},
  )
})()

function createFireAuth(firebase) {
  var authMachine = nanostate('unknown', {
    unknown: {userNotNil: 'signedIn', userNil: 'signedOut'},
    signedIn: {userNil: 'signedOut'},
    signedOut: {userNotNil: 'signedIn'},
  })

  var extendedState = {user: null}
  firebase.auth().onAuthStateChanged(user => {
    extendedState.user = user
    authMachine.emit(R.isNil(user) ? 'userNil' : 'userNotNil')
  })

  const authMachineStateAtom = m.createAtom('authMachineState')
  authMachine.on('*', () => authMachineStateAtom.reportChanged())

  function getAuthState() {
    authMachineStateAtom.reportObserved()
    return {type: authMachine.state, user: extendedState.user}
  }

  function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.setCustomParameters({prompt: 'select_account'})
    return firebase.auth().signInWithRedirect(provider)
  }
  function signOut() {
    return firebase.auth().signOut()
  }
  return {
    get uid() {
      const user = getAuthState().user
      ow(user, ow.object.label('user').hasKeys('uid'))
      ow(user.uid, ow.string.label('uid').nonEmpty)
      return user.uid
    },
    get displayName() {
      const user = getAuthState().user
      ow(user, ow.object.label('user').hasKeys('displayName'))
      return user.displayName
    },
    get isSignedIn() {
      return getAuthState().type === 'signedIn'
    },
    get isAuthKnown() {
      return getAuthState().type !== 'unknown'
    },
    signIn,
    signOut,
  }
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
