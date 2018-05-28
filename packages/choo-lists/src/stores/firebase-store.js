const R = require('ramda')
const RA = require('ramda-adjunct')
const pReflect = require('p-reflect')
const log = require('nanologger')('firebaseStore')
const firebase = require('firebase/app')
const G = require('../models/grain')
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

function getCollection(path) {
  return firebase.firestore().collection(path)
}

function grainForFirebase(grain) {
  return R.omit(['_ref'], grain)
}

const omitFirebaseClutter = R.pickBy(
  (val, key) =>
    !(
      key.length <= 2 ||
      RA.isFunction(val) ||
      R.head(key) === '_'
    ),
);


module.exports = createStore({
  namespace: 'firebase',
  initialState: {authState: 'loading'},
  events: {
    DOMContentLoaded: ({store, actions: {render, syncGrains}}) => {
      firebase.initializeApp(config)
      firebase.firestore().settings({timestampsInSnapshots: true})
      pReflect(firebase.firestore().enablePersistence())
        .then(res => log.debug('enablePersistence res', res))
        .then(() => {
          firebase.auth().onAuthStateChanged(user => {
            log.debug(
              'onAuthStateChanged user:',
              omitFirebaseClutter(user),
            )
            store.authState = 'signedOut'
            if (user) {
              store.authState = 'signedIn'
              store.grainsPath = `users/${user.uid}/grains`

              syncGrains()
              getCollection(store.grainsPath).onSnapshot(snapshot => {
                // log.debug('grains snapshot', omitFirebaseClutter(snapshot))
                log.debug('grains docChanges', snapshot.docChanges())
              })
            }
            render()
          })
        })
    },
    signIn: () => {
      var provider = new firebase.auth.GoogleAuthProvider()
      provider.setCustomParameters({prompt: 'select_account'})
      firebase.auth().signInWithRedirect(provider)
    },
    signOut: () => {
      firebase.signOut()
    },
    syncGrains: ({state, store}) => {
      log.debug('syncGrains', state.grains.list, store)
      // const grainsCollection = getCollection(store.grainsPath)
      // state.grains.list.forEach(grain => {
      //   const grainRef = grainsCollection.doc(G.getId(grain))
      //   firebase
      //     .firestore()
      //     .runTransaction(function(transaction) {
      //       // This code may get re-run multiple times if there are conflicts.
      //       return transaction.get(grainRef).then(function(grainSnapshot) {
      //         log.debug('transaction:grainSnapshot', grainSnapshot)
      //         if (grainSnapshot.exists) {
      //           throw new Error('Document exists! wont update')
      //         } else {
      //           transaction.set(grainRef, grainForFirebase(grain))
      //         }
      //       })
      //     })
      //     .then(function() {
      //       log.debug('Transaction successfully committed!')
      //     })
      //     .catch(function(error) {
      //       log.warn('Transaction failed: ', error)
      //     })
      // })
    },
  },
})
