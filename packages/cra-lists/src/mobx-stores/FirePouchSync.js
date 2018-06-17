import {FirebaseService} from './FirebaseService'
import {reaction} from 'mobx'
import ow from 'ow'
import {getAppActorId} from '../lib/app-actor-id'
import {createLSItem} from '../lib/LocalStorageService'
import {SF} from '../safe-fun'

const a = require('nanoassert')
const R = require('ramda')

const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp
const PQueue = require('p-queue')
const pEachSeries = require('p-each-series')
const m = require('mobx')
const validate = require('aproba')

export function FirePouchSync(pouchStore) {
  const fireSync = m.observable(
    {
      isSyncing: false,
      disposers: m.observable.array([], {deep: false}),
      queue: new PQueue({concurrency: 1}),
      disposeAll() {
        this.disposers.forEach(fn => fn())
        this.disposers.clear()
      },
      onError(e) {
        console.error('Stopping FirePouchSync', e)
        this.disposeAll()
        this.queue.clear()
        debugger
      },
      addToQueue: function(thunk, options = {}) {
        console.log('Entering addToQueue(thunk, options)', options)
        this.queue.add(
          () =>
            thunk()
              .then((...args) => {
                console.log(
                  'Thunk processing complete',
                  options,
                  ...args,
                )
              })
              .catch(this.onError),
          options,
        )
      },

      startSync(cRef) {
        validate('O', arguments)
        ow(this.isSyncing, ow.boolean.label('isSyncing').false)
        this.isSyncing = true

        this.disposers.push(
          syncToFirestore(this.addToQueue, cRef, pouchStore),
          startSyncFromFirestore(this.addToQueue, cRef, pouchStore),
        )
      },
    },
    {
      queue: m.observable.ref,
      disposeAll: m.action.bound,
      startSync: m.action.bound,
      onError: m.action.bound,
    },
    {name: `PouchFireSync: ${pouchStore.name}`},
  )
  fireSync.addToQueue = fireSync.addToQueue.bind(fireSync)
  reaction(
    () => [FirebaseService.auth.isSignedIn, fireSync.isSyncing],
    () => {
      if (FirebaseService.auth.isSignedIn && !fireSync.isSyncing) {
        const cRef = FirebaseService.createUserCollectionRef(
          pouchStore.name,
        )
        fireSync.startSync(cRef)
      }
    },
  )
  return {startSync: fireSync.startSync}
}

function isModifiedByLocalActor(doc) {
  ow(doc.actorId, ow.string.label('doc.actorId').nonEmpty)
  return R.equals(doc.actorId, getAppActorId())
}

// const isModifiedByRemoteActor = R.complement(isModifiedByLocalActor)
const dateMilliPredicate = ow.number.integer.positive

const isOlder = function isOlder(doc1, doc2) {
  ow(doc1.modifiedAt, dateMilliPredicate)
  ow(doc2.modifiedAt, dateMilliPredicate)
  return doc1.modifiedAt < doc2.modifiedAt
}

function shouldSkipFirestoreSync(doc) {
  // debugger
  return doc.skipFirestoreSync
}

function isVersionOlder(doc1, doc2) {
  const versionPred = ow.number.integer.greaterThanOrEqual(0)
  ow(doc1.version, versionPred)
  ow(doc2.version, versionPred)
  return doc1.version < doc2.version
}

async function processPouchChange(cRef, pouchStore, pouchChange) {
  const doc = pouchChange.doc
  console.debug('processPouchChange', doc)
  if (shouldSkipFirestoreSync(doc)) return
  ow(
    isModifiedByLocalActor(doc),
    ow.boolean.label('isModifiedByLocalActor(doc)').true,
  )
  // continue since doc is modified locally
  const docRef = cRef.doc(pouchChange.id)
  await docRef.firestore.runTransaction(async transaction => {
    const snap = await transaction.get(docRef)

    function transactionSetDocWithTimestamp() {
      return transaction.set(
        docRef,
        R.merge(pouchChange.doc, {
          serverTimestamp: serverTimestamp(),
        }),
      )
    }

    if (!snap.exists) {
      return transactionSetDocWithTimestamp()
    }

    const fireDoc = snap.data()
    const isPouchDocOlderThanFireDoc = isOlder(doc, fireDoc)
    // const areVersionsDifferent = versionMismatch(doc, fireDoc)
    const isPouchVersionOlderThenFire = isVersionOlder(doc, fireDoc)
    const isFireVersionOlderThenPouch = isVersionOlder(fireDoc, doc)

    const wasFireDocModifiedByLocalActor = isModifiedByLocalActor(
      fireDoc,
    )

    function transactionEmptyUpdate() {
      return transaction._update(docRef, {})
    }

    function transactionSetDocWithTimestampAndIncrementVersion() {
      return transaction.set(
        docRef,
        R.merge(pouchChange.doc, {
          serverTimestamp: serverTimestamp(),
          version: fireDoc.version + 1,
        }),
      )
    }

    function transactionSetInHistoryCollection(doc) {
      console.warn('transactionSetInHistoryCollection')
      transaction.set(
        docRef.collection('history').doc(`${doc.modifiedAt}`),
        doc,
      )
    }

    if (wasFireDocModifiedByLocalActor) {
      // both docs were locally modified.
      // we shouldn't blindly push, when pouch doc is older
      a.notOk(
        isPouchDocOlderThanFireDoc,
        'locally modified pouchDoc is older than locally modified fireDoc. This should never happen',
        doc,
        fireDoc,
      )
      return transactionSetDocWithTimestampAndIncrementVersion()
    } else {
      // pouch locallyModified, fire remotely modified
      if (isPouchDocOlderThanFireDoc) {
        if (!isPouchVersionOlderThenFire) {
          transactionSetInHistoryCollection(doc)
        }
        return transactionEmptyUpdate()
      } else {
        if (!isFireVersionOlderThenPouch) {
          transactionSetInHistoryCollection(fireDoc)
        }
        return transactionSetDocWithTimestampAndIncrementVersion()
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

  async function processFirestoreDoc(fireDoc) {
    function putDocWithSkipFirestoreSync(doc) {
      return pouchStore.put(R.merge(doc, {skipFirestoreSync: true}))
    }

    if (isModifiedByLocalActor(fireDoc)) {
      try {
        await putDocWithSkipFirestoreSync(fireDoc)
      } catch (e) {
        console.log('ignoring firestore update.', e, fireDoc)
      }
    } else {
      let pouchDoc = null
      try {
        pouchDoc = await pouchStore.get(fireDoc._id)
      } catch (e) {
        console.log('inserting new remotely created doc', e)
        return putDocWithSkipFirestoreSync(SF.omit(['_rev'], fireDoc))
      }
      if (isOlder(pouchDoc, fireDoc)) {
        const remoteDocWithLocalRev = R.merge(fireDoc, {
          _rev: pouchDoc._rev,
        })
        return putDocWithSkipFirestoreSync(remoteDocWithLocalRev)
      } else {
        console.warn(
          `ignoring 'older' firestore doc`,
          fireDoc,
          pouchDoc,
        )
      }
    }
  }

  async function onFireDocChange(docChange) {
    const fireDoc = docChange.doc.data()
    console.debug('onFireDocChange', fireDoc)
    await processFirestoreDoc(fireDoc)
    setSyncFirestoreTimestampFromFireDoc(fireDoc)
  }

  const firestoreTimestamp = getSyncFirestoreTimestamp()
  console.log('since firestoreTimestamp', firestoreTimestamp)
  return cRef
    .where('serverTimestamp', '>', firestoreTimestamp)
    .orderBy('serverTimestamp')
    .onSnapshot(querySnapshot =>
      addToQueue(
        () =>
          pEachSeries(querySnapshot.docChanges(), onFireDocChange),
        {priority: 0},
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
    .on('change', change =>
      addToQueue(
        async () => {
          // if (shouldSkipFirestoreSync(change.doc)) return
          await processPouchChange(cRef, pouchStore, change)
          syncSeq.set(change.seq)
        },
        {priority: 0},
      ),
    )
  return () => changes.cancel()
}
