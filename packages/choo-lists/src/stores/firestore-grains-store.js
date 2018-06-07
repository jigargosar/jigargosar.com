import {getAppActorId} from './actor-id'
import * as Kefir from 'kefir'
import {PDBGrain} from '../mst-models/pdb-grains-collection'

const R = require('ramda')
const RA = require('ramda-adjunct')
const log = require('nanologger')('firestore-grains-store')
const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
const assert = require('assert')
const createStore = require('./createStore')
const LocalStorageItem = require('./local-storage-item')
const pEachSeries = require('p-each-series')
const PLazy = require('p-lazy')

const Timestamp = firebase.firestore.Timestamp

const syncSeqLS = LocalStorageItem(
  'choo-list:syncedTillSequenceNumber',
  0,
)

const syncFSMilliLS = LocalStorageItem(
  'choo-list:syncedTillFirestoreMilli',
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

function mergeFirestoreServerTimestamp(localDoc) {
  const fireStoreServerTimestamp = firebase.firestore.FieldValue.serverTimestamp()
  return R.merge(localDoc, {
    fireStoreServerTimestamp,
  })
}

export function syncFromPDBToFireStore(state, emitter) {
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
        .scan(async (prevPromise, change) => {
          await prevPromise
          await onChange(change)
          syncSeqLS.save(change.seq)
        }, Promise.resolve())
        .takeErrors(1)
        .observe({
          error(error) {
            log.error('syncFromPDBToFireStore', error)
          },
        })
      unsubscribe = () => subscription.unsubscribe()

      async function onChange(change) {
        // Update remote firebase
        // iff we have changes from local actor, which are newer

        log.debug('pdb:change', change.id, change)
        const localDoc = PDBGrain.create(change.doc)

        if (!hasLocalActorId(localDoc)) {
          return
        }
        const docRef = grainsRef.doc(change.id)
        await grainsRef.firestore.runTransaction(
          async transaction => {
            const remoteDocSnapshot = await transaction.get(docRef)
            if (!remoteDocSnapshot.exists) {
              transaction.set(
                docRef,
                mergeFirestoreServerTimestamp(localDoc),
              )
              return
            }
            const remoteDoc = PDBGrain.create(
              remoteDocSnapshot.data(),
            )
            if (isNewerThan(remoteDoc, localDoc)) {
              transaction.update(docRef, {})
              return
            }
            if (!hasLocalActorId(remoteDoc)) {
              addToHistory(docRef, remoteDoc, transaction)
            }
            transaction.update(docRef, localDoc)
          },
        )
      }
    } else if (state.authState === 'signedOut') {
      unsubscribe()
    } else {
      assert.fail(`Invalid AuthState ${state.authState}`)
    }
  })
}

function createSnapshotStream(grainsRef) {
  return Kefir.stream(emitter => {
    return grainsRef.onSnapshot(
      emitter.value,
      emitter.error,
      emitter.end,
    )
  })
}

export function syncFromFirestoreToPDB(state, emitter) {
  let unsubscribe = R.identity
  emitter.on(state.events.firebase_auth_state_changed, () => {
    unsubscribe()

    if (state.authState === 'signedIn') {
      const grainsRef = createUserGrainsCollectionRef(state)

      const syncSinceTimestamp = Timestamp.fromMillis(
        syncFSMilliLS.load(),
      )
      unsubscribe = createSnapshotStream(
        grainsRef
          .where('fireStoreServerTimestamp', '>', syncSinceTimestamp)
          .orderBy('fireStoreServerTimestamp'),
      )
        .scan(async (prevPromise, snapshot) => {
          await prevPromise
          const changes = snapshot.docChanges()
          log.debug('snapshot:changes', changes)
          await pEachSeries(changes, async change => {
            const firestoreTimestamp = change.doc.data()
              .fireStoreServerTimestamp
            assert(RA.isNotNil(firestoreTimestamp))
            await state.grains.handleFirestoreChange(change)
            syncFSMilliLS.save(firestoreTimestamp.toMillis())
          })
        }, Promise.resolve())
        .takeErrors(1)
        .observe({
          error(error) {
            log.error('syncFromFirestoreToPDB', error)
          },
        })
    } else if (state.authState === 'signedOut') {
      unsubscribe()
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
