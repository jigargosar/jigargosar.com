const pEachSeries = require('p-each-series')
const R = require('ramda')
const RA = require('ramda-adjunct')
const pReflect = require('p-reflect')
const log = require('nanologger')('firestore-grains-store')
const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
const assert = require('assert')
const createStore = require('./createStore')
const LocalStorageItem = require('./local-storage-item')

const syncSeqLS = LocalStorageItem(
  'choo-list:syncedTillSequenceNumber',
  0,
)

module.exports = function firestoreGrainsStore(state, emitter) {
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
