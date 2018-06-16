import {FirebaseService} from './FirebaseService'
import {observable, reaction} from 'mobx'
import ow from 'ow'
import {getAppActorId} from '../lib/app-actor-id'
import {createLSItem} from '../lib/LocalStorageService'

const R = require('ramda')

const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp
const PQueue = require('p-queue')
const pEachSeries = require('p-each-series')
const m = require('mobx')

export function FirePouchSync(pouchStore) {
  const fireSync = observable(
    {
      _syncing: false,
      _disposers: m.observable.shallowArray([]),
      disposeAll() {
        this._disposers.forEach(fn => fn())
        this._disposers.clear()
      },
      addDisposers(...disposers) {
        this._disposers.push(...disposers)
      },
    },
    {disposeAll: m.action.bound, addDisposers: m.action.bound},
    {name: `PouchFireSync: ${pouchStore.name}`},
  )
  reaction(
    () => [FirebaseService.user, fireSync._syncing],
    () => {
      if (FirebaseService.user && !fireSync._syncing) {
        fireSync.syncing = true
        const cRef = FirebaseService.createUserCollectionRef(
          pouchStore.name,
        )
        const queue = new PQueue({concurrency: 1})

        function addToQueue(thunk) {
          queue.add(() =>
            thunk().catch(e => {
              console.error('Stopping FirePouchSync', e)
              fireSync.disposeAll()
              queue.clear()
            }),
          )
        }

        fireSync.addDisposers(
          syncToFirestore(addToQueue, cRef, pouchStore),
          startSyncFromFirestore(addToQueue, cRef, pouchStore),
        )
      }
    },
  )
  return fireSync
}

function isModifiedByLocalActor(doc) {
  ow(doc.actorId, ow.string.label('doc.actorId').nonEmpty)
  return R.equals(doc.actorId, getAppActorId())
}

const isModifiedByRemoteActor = R.complement(isModifiedByLocalActor)
const nowPredicate = ow.number.integer.positive

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
      debugger
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

function startSyncFromFirestore(addToQueue, cRef, pouchStore) {
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

  function setSyncFirestoreTimestampFromFireDoc(fireDoc) {
    return syncTimestamp.set(fireDoc.serverTimestamp)
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

  async function onFireDocChange(docChange) {
    const fireDoc = docChange.doc.data()
    console.log('fireDoc', fireDoc)
    await processFirestoreDoc(fireDoc)
    setSyncFirestoreTimestampFromFireDoc(fireDoc)
  }

  const firestoreTimestamp = getSyncFirestoreTimestamp()
  console.log('since firestoreTimestamp', firestoreTimestamp)
  return cRef
    .where('serverTimestamp', '>', firestoreTimestamp)
    .orderBy('serverTimestamp')
    .onSnapshot(querySnapshot =>
      addToQueue(() =>
        pEachSeries(querySnapshot.docChanges(), onFireDocChange),
      ),
    )
}
function syncToFirestore(addToQueue, cRef, pouchStore) {
  ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)

  const syncSeq = createLSItem(
    `PouchChangesQueue.${pouchStore.name}.lastSyncSeq`,
    0,
  )
  const changes = pouchStore
    .liveChanges({since: syncSeq.get()})
    .on('change', async change => {
      await processPouchChange(cRef, pouchStore, change)
      syncSeq.set(change.seq)
    })
  return () => changes.cancel()
}
