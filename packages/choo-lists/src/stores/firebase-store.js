const R = require('ramda')
const RA = require('ramda-adjunct')
const pReflect = require('p-reflect')
const log = require('nanologger')('firebaseStore')
const firebase = require('firebase/app')
const G = require('../models/grain')
require('firebase/auth')
require('firebase/firestore')
const assert = require('assert')

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

const omitFirebaseClutter = R.unless(
  R.isNil,
  R.pickBy(
    (val, key) =>
      !(key.length <= 2 || RA.isFunction(val) || R.head(key) === '_'),
  ),
)
module.exports = createStore({
  namespace: 'firebase',
  initialState: {authState: 'loading', userInfo: null, grainsLookup: {}},
  events: {
    DOMContentLoaded: ({store, actions: {render, syncGrains}}) => {
      firebase.initializeApp(config)
      firebase.firestore().settings({timestampsInSnapshots: true})
      pReflect(firebase.firestore().enablePersistence())
        .then(res => log.debug('enablePersistence res', res))
        .then(() => {
          let isFirstSnapshot = true
          firebase.auth().onAuthStateChanged(user => {
            try {
              store.userInfo = omitFirebaseClutter(user)
              log.debug('onAuthStateChanged userInfo:', store.userInfo)
              store.authState = 'signedOut'
              store.grainsLookup = {}
              if (user) {
                store.authState = 'signedIn'
                store.grainsPath = `users/${user.uid}/grains`
                store.grainsHistoryPath = `users/${user.uid}/grains-history`

                const docFromChangeObj = handler => change =>
                  handler(change.doc.id, change.doc.data())

                const typeEq = R.propEq('type')
                const handleChange = R.cond([
                  [
                    typeEq('added'),
                    docFromChangeObj((id, doc) => {
                      assert(!R.has(id, store.grainsLookup))
                      store.grainsLookup[id] = doc
                    }),
                  ],
                  [
                    typeEq('modified'),
                    docFromChangeObj((id, doc) => {
                      assert(R.has(id, store.grainsLookup))
                      store.grainsLookup[id] = doc
                    }),
                  ],
                  [
                    typeEq('removed'),
                    docFromChangeObj(id => {
                      assert(R.has(id, store.grainsLookup))
                      delete store.grainsLookup[id]
                    }),
                  ],
                  [
                    R.T,
                    change => {
                      console.error(change)
                    },
                  ],
                ])
                getCollection(store.grainsPath).onSnapshot(snapshot => {
                  log.debug('grains docChanges', snapshot.docChanges())

                  snapshot.docChanges().forEach(handleChange)
                  render()
                  if (isFirstSnapshot) {
                    syncGrains()
                    isFirstSnapshot = false
                  }
                })
              }
              render()
            } catch (e) {
              debugger
            }
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
      const grainsCollection = getCollection(store.grainsPath)
      const grainsHistoryCollection = getCollection(store.grainsHistoryPath)
      state.grains.list.forEach(grain => {
        if (R.equals(grain, store.grainsLookup[G.getId(grain)])) {
          log.debug('Doc up to date')
          return
        }
        const grainRef = grainsCollection.doc(G.getId(grain))
        firebase
          .firestore()
          .runTransaction(function(transaction) {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(grainRef).then(function(grainSnapshot) {
              log.debug('transaction:grainSnapshot', grainSnapshot)
              if (grainSnapshot.exists) {
                const snapshotGrain = grainSnapshot.data()
                if (G.getActorId(snapshotGrain) !== G.getActorId(grain)) {
                  transaction.set(grainsHistoryCollection.doc(), snapshotGrain)
                }
                transaction.set(grainRef, grain)
              } else {
                transaction.set(grainRef, grain)
              }
            })
          })
          .then(function() {
            log.debug('Transaction successfully committed!')
          })
          .catch(function(error) {
            log.warn('Transaction failed: ', error)
          })
      })
    },
  },
})
