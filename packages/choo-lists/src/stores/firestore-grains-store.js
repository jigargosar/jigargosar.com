import {getAppActorId} from './actor-id'
import * as Kefir from 'kefir'

const R = require('ramda')
const RA = require('ramda-adjunct')
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

function createUserGrainsCollectionRef(state) {
  return state.firestore.collection(
    `users/${state.userInfo.uid}/${`grains`}`,
  )
}

module.exports = function firestoreGrainsStore(state, emitter) {
  let disposer = R.identity
  let unsubscribe = R.identity
  emitter.on(state.events.firebase_auth_state_changed, () => {
    unsubscribe()

    if (state.authState === 'signedIn') {
      const grainsRef = createUserGrainsCollectionRef(state)
      const since = syncSeqLS.load()
      log.debug('start sync. seq:', since)
      const subscription = state.grains
        .changesStream({
          include_docs: true,
          live: true,
          since,
        })
        .flatMap(R.compose(Kefir.fromPromise, onChange))
        .takeErrors(1)
        .observe({
          value(seq) {
            log.debug('synced till seq:', seq)
            syncSeqLS.save(seq)
          },
          error(error) {
            log.error('sync error', error)
          },
        })
      unsubscribe = () => subscription.unsubscribe()

      function onChange(change) {
        // Update remote firebase
        // iff we have changes from local actor, which are newer

        log.debug('change', change.id, change)
        const localDoc = change.doc

        if (!hasLocalActorId(localDoc)) {
          return Promise.resolve(change.seq)
        }
        const docRef = grainsRef.doc(change.id)
        return grainsRef.firestore.runTransaction(
          async transaction => {
            const remoteDocSnapshot = await transaction.get(docRef)
            if (!remoteDocSnapshot.exists) {
              transaction.set(docRef, localDoc)
              return change.seq
            }
            const remoteDoc = remoteDocSnapshot.data()
            if (isNewerThan(remoteDoc, localDoc)) {
              transaction.update(docRef, {})
            } else {
              if (!hasLocalActorId(remoteDoc)) {
                addToHistory(docRef, remoteDoc, transaction)
              }
              transaction.update(docRef, localDoc)
            }
            return change.seq
          },
        )
      }
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
