const {grainsPD} = require('../state')
const pEachSeries = require('p-each-series')
const R = require('ramda')
const RA = require('ramda-adjunct')
const pReflect = require('p-reflect')
const log = require('nanologger')('firebaseStore')
const firebase = require('firebase/app')
const G = require('../models/grain')
const {actions: GA} = require('../stores/grains-store')
require('firebase/auth')
require('firebase/firestore')
const assert = require('assert')
const createStore = require('./createStore')
const LocalStorageItem = require('./local-storage-item')

const syncSeqLS = LocalStorageItem(
  'choo-list:syncedTillSequenceNumber',
  0,
)

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
  initialState: {
    authState: 'loading',
    userInfo: null,
    grainsLookup: {},
  },
  events: {
    DOMContentLoaded: ({store, actions: {render, syncGrains}}) => {
      firebase.initializeApp(config)
      firebase.firestore().settings({timestampsInSnapshots: true})
      firebase.auth().onAuthStateChanged(user => {
        store.userInfo = omitFirebaseClutter(user)
        log.debug('onAuthStateChanged userInfo:', store.userInfo)
        store.authState = 'signedOut'
        store.grainsLookup = {}
        if (user) {
          store.authState = 'signedIn'
          store.grainsPath = `users/${user.uid}/grains`
          store.grainsHistoryPath = `users/${user.uid}/grains-history`
          // syncGrains()
          // getCollection(store.grainsPath).onSnapshot(snapshot => {
          //   snapshot.docChanges().forEach(change => {
          //     log.debug('grains: onChange', change)
          //     GA.updateFromRemote({
          //       type: change.type,
          //       id: change.doc.id,
          //       doc: change.doc.data(),
          //     })
          //   })
          // })
        }
        render()
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
      const since = syncSeqLS.load()
      log.debug('grains: start sync from seq', since)
      const grainsCollection = getCollection(store.grainsPath)
      const grainsHistoryCollection = getCollection(
        store.grainsHistoryPath,
      )

      grainsPD(state)
        ._db.changes({
          include_docs: true,
          live: true,
          since,
        })
        .on('change', function(change) {
          // log.debug('pdb:changes last_seq', res.last_seq, res.results)
          const localGrain = change.doc
          assert(G.getId(localGrain) === change.id)
          const grainRef = grainsCollection.doc(G.getId(localGrain))
          firebase
            .firestore()
            .runTransaction(function(transaction) {
              // This code may get re-run multiple times if there are conflicts.
              return transaction
                .get(grainRef)
                .then(function(grainSnapshot) {
                  if (grainSnapshot.exists) {
                    const remoteGrain = grainSnapshot.data()
                    const [oldG, newG] = R.unless(
                      ([a, b]) =>
                        G.getModifiedAt(a) <= G.getModifiedAt(b),
                      ([a, b]) => [b, a],
                    )([localGrain, remoteGrain])

                    if (G.getActorId(oldG) !== G.getActorId(newG)) {
                      transaction.set(
                        grainsHistoryCollection.doc(),
                        oldG,
                      )
                    }
                    if (G.isFlaggedAsDeleted(newG)) {
                      transaction.delete(grainRef)
                    }
                    transaction.set(grainRef, newG)
                  } else {
                    if (G.isFlaggedAsDeleted(localGrain)) {
                      transaction.delete(grainRef)
                    } else {
                      transaction.set(grainRef, localGrain)
                    }
                  }
                })
            })
            .then(function() {
              log.debug('grains synced till seq', change.seq)
              syncSeqLS.save(change.seq)
            })
        })
    },
  },
})
