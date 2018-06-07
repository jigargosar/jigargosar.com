import {getAppActorId} from './actor-id'

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

const hasLocalActorId = R.propEq('actorId', getAppActorId())

function isNewerThan(doc1, doc2) {
  return doc1.modifiedAt > doc2.modifiedAt
}

function addToHistory(docRef, doc, transaction) {
  transaction.set(
    docRef.collection('history').doc(`${doc.modifiedAt}`),
    doc,
  )
}

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

      const since = syncSeqLS.load()
      log.debug('start sync. seq:', since)
      const changes = state.grains
        .changes({
          include_docs: true,
          live: true,
          since,
        })
        .on('change', change => {
          // Update remote firebase
          // iff we have changes from local actor, which are newer

          log.debug('change', change.id, change)
          const localDoc = change.doc

          if (!hasLocalActorId(localDoc)) return
          const docRef = collection.doc(change.id)
          state.firestore
            .runTransaction(async transaction => {
              const remoteDocSnapshot = await transaction.get(docRef)
              if (!remoteDocSnapshot.exists) {
                transaction.set(docRef, localDoc)
                return
              }
              const remoteDoc = remoteDocSnapshot.data()
              if (isNewerThan(remoteDoc, localDoc)) {
                transaction.update(docRef, {})
              } else {
                if (!hasLocalActorId(remoteDoc)) {
                  addToHistory(docRef, remoteDoc, transaction)
                }
                transaction.set(docRef, localDoc)
              }
            })
            .then(() => {
              log.debug('synced till seq:', change.seq)
              syncSeqLS.save(change.seq)
            })
            .catch(e => {
              log.error(
                'Syncing Stopped Handle this use case using events',
                e,
              )
              disposer()
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
