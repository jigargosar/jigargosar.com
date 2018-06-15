import {FirebaseStore} from './FirebaseStore'
import {action, observable, reaction} from 'mobx'
import ow from 'ow'
import {getAppActorId} from '../LocalStorage'
import {createLSItem} from './local-storage-store'

const R = require('ramda')

const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp
const PQueue = require('p-queue')

export function FirePouchSync(pouchStore) {
  const fireSync = observable(
    {
      syncMilli: 0,
      syncing: false,
      fireQueue: [],
      queueFireSnapshot(snapshot) {
        this.fireQueue.push(snapshot)
      },
      pouchChangesQueue: PouchChangesQueue(pouchStore),
      syncFromFireStore: SyncFromFirestore(),
      trySync() {
        if (FirebaseStore.user && !fireSync.syncing) {
          try {
            fireSync.syncing = true
            const cRef = FirebaseStore.getUserCollectionRef(
              pouchStore.name,
            )
            fireSync.pouchChangesQueue.syncToFirestore(cRef)
            fireSync.syncFromFireStore.startSyncFromFirestore(
              cRef,
              pouchStore,
            )
          } catch (e) {
            console.error(e)
          }
        }
      },
    },
    {queueFireSnapshot: action.bound, trySync: action.bound},
    {name: `PouchFireSync: ${pouchStore.name}`},
  )
  reaction(
    () => [FirebaseStore.user, fireSync.syncing],
    fireSync.trySync,
  )
  return fireSync
}

function isModifiedByLocalActor(doc) {
  ow(doc.actorId, ow.string.label('doc.actorId').nonEmpty)
  return R.equals(doc.actorId, getAppActorId())
}

const isModifiedByRemoteActor = R.complement(isModifiedByLocalActor)
const nowPredicate = ow.number.integer.positive

// const isNewer = function isNewer(doc1, doc2) {
//   ow(doc1.modifiedAt, nowPredicate)
//   ow(doc2.modifiedAt, nowPredicate)
//   return doc1.modifiedAt > doc2.modifiedAt
// }
const isOlder = function isOlder(doc1, doc2) {
  ow(doc1.modifiedAt, nowPredicate)
  ow(doc2.modifiedAt, nowPredicate)
  return doc1.modifiedAt < doc2.modifiedAt
}
function shouldSkipFirestoreSync(doc) {
  return doc.skipFirestoreSync
}
function versionMismatch(doc1, doc2) {
  const versionPred = ow.number.integer.greaterThanOrEqual(0)
  ow(doc1.version, versionPred)
  ow(doc2.version, versionPred)
  return !R.equals(doc1.version, doc2.version)
}

async function processPouchChange(cRef, pouchStore, pouchChange) {
  const doc = pouchChange.doc
  if (shouldSkipFirestoreSync(doc) || isModifiedByRemoteActor(doc))
    return
  // modified locally by user
  const docRef = cRef.doc(pouchChange.id)
  await docRef.firestore.runTransaction(async transaction => {
    const snap = await transaction.get(docRef)

    if (!snap.exists) {
      return transactionSetDocWithTimestamp()
    }
    const fireDoc = snap.data()

    const isPouchDocOlderThanFireDoc = isOlder(doc, fireDoc)
    const areVersionsDifferent = versionMismatch(doc, fireDoc)
    const wasFireDocModifiedByLocalActor = isModifiedByLocalActor(
      fireDoc,
    )

    function logWarningForEmptyTransactionUpdate() {
      if (areVersionsDifferent) {
        console.warn(
          'transactionEmptyUpdate: since versions are different',
          doc,
          fireDoc,
        )
      } else {
        console.warn('transactionEmptyUpdate', doc, fireDoc)
      }
    }

    function transactionSetDocWithTimestamp() {
      return transaction.set(
        docRef,
        R.merge(pouchChange.doc, {
          serverTimestamp: serverTimestamp(),
        }),
      )
    }

    function transactionEmptyUpdate() {
      return transaction.update(docRef, {})
    }

    // function transactionSetDocWithTimestampAndIncrementVersion() {
    //   return transaction.set(
    //     docRef,
    //     R.merge(pouchChange.doc, {
    //       serverTimestamp: serverTimestamp(),
    //       version: fireDoc.version + 1,
    //     }),
    //   )
    // }

    function transactionSetInHistoryCollection(doc) {
      console.warn('transactionSetInHistoryCollection')
      transaction.set(
        docRef.collection('history').doc(`${doc.modifiedAt}`),
        doc,
      )
    }

    if (wasFireDocModifiedByLocalActor) {
      // both docs were locally modified.
      // we shouldn't blindly push, unless local version is newer
      if (isPouchDocOlderThanFireDoc || areVersionsDifferent) {
        logWarningForEmptyTransactionUpdate()
        return transactionEmptyUpdate()
      } else {
        return transactionSetDocWithTimestamp()
      }
    } else {
      if (isPouchDocOlderThanFireDoc) {
        transactionSetInHistoryCollection(doc)
        return transactionEmptyUpdate()
      } else {
        // debugger
        // should remote doc be put in history?
        // if (doc.version < fireDoc.version) {
        //   transactionSetInHistoryCollection(fireDoc)
        // }
        // const result = await pouchStore.get(pouchChange.id)
        // console.log(result)
        // debugger
        // return transactionSetDocWithTimestampAndIncrementVersion()
        return transactionSetDocWithTimestamp()
      }
    }
  })
}

function PouchChangesQueue(pouchStore) {
  ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)

  const syncSeq = createLSItem(
    `PouchChangesQueue.${pouchStore.name}.lastSyncSeq`,
    0,
  )

  const queue = new PQueue({concurrency: 1})

  return {
    syncToFirestore(cRef) {
      const changes = pouchStore
        .liveChanges({since: syncSeq.get()})
        .on('change', change => {
          queue.add(() =>
            processPouchChange(cRef, pouchStore, change)
              .then(() => syncSeq.set(change.seq))
              .catch(e => {
                console.log('Error syncToFirestore. Stopping', e)
                changes.cancel()
                queue.clear()
              }),
          )
        })
    },
  }
}

function SyncFromFirestore() {
  const queue = new PQueue({concurrency: 1})

  return {
    startSyncFromFirestore(cRef, pouchStore) {
      ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)

      const syncTimestamp = createLSItem(
        `FirestoreChangesQueue.${
          pouchStore.name
        }.lastSyncFirestoreTimestamp`,
        Timestamp.fromMillis(0),
      )
      function getSyncFirestoreTimestamp() {
        return new Timestamp(
          syncTimestamp.get().seconds,
          syncTimestamp.get().nanoseconds,
        )
      }

      function setSyncFirestoreTimestamp(firestoreTimestamp) {
        return syncTimestamp.set(firestoreTimestamp)
      }

      function processFirestoreDoc(fireDoc) {
        if (isModifiedByLocalActor(fireDoc)) return Promise.resolve()
        return pouchStore
          .get(fireDoc._id)
          .then(() => {
            debugger
          })
          .catch(e => {
            console.log(e)
            pouchStore.put(fireDoc)
          })
      }

      function onFirestoreQuerySnapshot(querySnapshot) {
        queue.add(() => {
          const docChanges = querySnapshot.docChanges()
          docChanges.forEach(function(docChange) {
            const fireDoc = docChange.doc.data()
            console.log('fireDoc', fireDoc)
            queue.add(() =>
              processFirestoreDoc(fireDoc)
                .then(() =>
                  setSyncFirestoreTimestamp(fireDoc.serverTimestamp),
                )
                .catch(e => {
                  console.log('Error syncFromFirestore. Stopping', e)
                  disposer()
                  queue.clear()
                }),
            )
          })
        })
      }
      const firestoreTimestamp = getSyncFirestoreTimestamp()
      console.log('since firestoreTimestamp', firestoreTimestamp)
      const disposer = cRef
        .where('serverTimestamp', '>', firestoreTimestamp)
        .orderBy('serverTimestamp')
        .onSnapshot(onFirestoreQuerySnapshot)
    },
  }
}
