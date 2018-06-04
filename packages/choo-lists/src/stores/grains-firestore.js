const {grainsPD} = require('../state')
const pEachSeries = require('p-each-series')
const R = require('ramda')
const RA = require('ramda-adjunct')
const pReflect = require('p-reflect')
const log = require('nanologger')('grainsFirestore')
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

module.exports = function grainsFirestore(state, emitter) {
  let disposer = R.identity
  emitter.on(state.events.firebase_auth_state_changed, () => {
    disposer()

    if (state.authState === 'signedIn') {
      const uid = state.userInfo.uid

      function userCollection(name) {
        return state.firestore.collection(`users/${uid}/${name}`)
      }

      const collection = userCollection(`grains`)
      const historyCollection = userCollection(`grains-history`)

      const since = syncSeqLS.load()
      log.debug('start sync. seq:', since)
      const changes = state.grains
        .changes({
          include_docs: true,
          live: true,
          since,
        })
        .on('change', change => {
          log.debug('change', change.id, change)
          const docRef = collection.doc(change.id)
          state.firestore
            .runTransaction(async transaction => {
              const remoteDocSnapshot = await transaction.get(docRef)
              const localDoc = change.doc
              if (remoteDocSnapshot.exists) {
                const remoteDoc = remoteDocSnapshot.data()
                if (remoteDoc.modifiedAt < localDoc.modifiedAt) {
                  transaction.set(
                    docRef
                      .collection('history')
                      .doc(remoteDoc.modifiedAt),
                    remoteDoc,
                  )
                  transaction.set(docRef, localDoc)
                } else {
                  transaction.update(docRef, {})
                }
              } else {
                transaction.set(docRef, localDoc)
              }
            })
            .then(() => {
              log.debug('synced till seq:', change.seq)
              syncSeqLS.save(change.seq)
            })
        })

      disposer = () => changes.cancel()
    } else if (state.authState === 'signedOut') {
    } else {
      assert.fail(`Invalid AuthState ${state.authState}`)
    }
  })
}

const st = {
  events: {
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
    DOMContentLoaded: ({store, actions: {render, syncGrains}}) => {
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
    },
  },
}
