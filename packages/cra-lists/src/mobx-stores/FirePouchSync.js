import {FirebaseStore} from './FirebaseStore'
import {action, observable, reaction} from 'mobx'
import ow from 'ow'
import {getAppActorId} from '../LocalStorage'
import {ls} from './local-storage-store'

const R = require('ramda')

const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp
const pouchSeqPred = ow.number.integer
  .label('pouch.seq')
  .greaterThanOrEqual(0)

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
      firestoreChangesQueue: FirestoreChangesQueue(pouchStore),
      trySync() {
        if (FirebaseStore.user && !fireSync.syncing) {
          try {
            fireSync.syncing = true
            const cRef = FirebaseStore.getUserCollectionRef(
              pouchStore.name,
            )
            fireSync.pouchChangesQueue.syncToFirestore(cRef)
            fireSync.firestoreChangesQueue.syncFromFirestore(cRef)
          } catch (e) {
            debugger
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
  // fireSync.trySync()
  return fireSync
}

// const localX = observable()
//
// window.addEventListener('storage', function(e) {
//
// })
const localforage = require('localforage')

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

function createLSItem(key, defaultValue) {
  return {
    get: () => ls.getOr(defaultValue, key),
    set: value => ls.set(key, value),
  }
}

function PouchChangesQueue(pouchStore) {
  ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)

  const syncSeq = createLSItem(
    `firestore.${pouchStore}.lastSyncSeq`,
    0,
  )

  const pouchQueue = observable(
    {
      pouchQueue: observable.array([], {deep: false}),
      cRef: null,
      syncing: false,
      queuePouchChange(change) {
        console.debug('queuePouchChange', change)
        this.pouchQueue.push(change)
        this.tryProcessingQueue()
      },

      async startQueuingChanges() {
        const since = syncSeq.get()
        pouchStore
          .liveChanges({since: since})
          .on('change', pouchQueue.queuePouchChange)
      },
      async processChange(change) {
        if (!change) return
        this.syncing = true
        const doc = change.doc
        if (
          shouldSkipFirestoreSync(doc) ||
          isModifiedByRemoteActor(doc)
        )
          return
        // modified locally by user
        const docRef = this.cRef.doc(change.id)
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
              R.merge(change.doc, {
                serverTimestamp: serverTimestamp(),
              }),
            )
          }

          function transactionEmptyUpdate() {
            return transaction.update(docRef, {})
          }

          function transactionSetWithTimestampAndIncrementVersion() {
            return transaction.set(
              docRef,
              R.merge(change.doc, {
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
            // we shouldn't blindly push, unless local version is newer
            if (isPouchDocOlderThanFireDoc || areVersionsDifferent) {
              logWarningForEmptyTransactionUpdate()
              return transactionEmptyUpdate()
            } else {
              return transactionSetDocWithTimestamp()
            }
          } else {
            if (isPouchDocOlderThanFireDoc) {
              debugger // should local doc be put in history?
              transactionSetInHistoryCollection(doc)
              return transactionEmptyUpdate()
            } else {
              debugger // should remote doc be put in history?
              if (doc.version < fireDoc.version) {
                transactionSetInHistoryCollection(fireDoc)
              }
              const result = await pouchStore.get(change.id)
              debugger
              return transactionSetWithTimestampAndIncrementVersion()
            }
          }
        })
      },
      stopSyncing() {
        this.syncing = false
      },
      async tryProcessingQueue() {
        if (
          !this.cRef ||
          this.syncing ||
          this.pouchQueue.length === 0
        )
          return
        const change = R.head(this.pouchQueue)
        await this.processChange(change)
        syncSeq.set(change.seq)
        this.pouchQueue.shift()
        this.stopSyncing(change)
        await this.tryProcessingQueue()
      },
      syncToFirestore(cRef) {
        this.cRef = cRef
        this.tryProcessingQueue()
      },
    },
    {
      queuePouchChange: action.bound,
      startQueuingChanges: action.bound,
    },
    {name: `PouchChangesQueue: ${pouchStore.name}`},
  )
  pouchQueue.startQueuingChanges()
  pouchQueue
    .loadSyncMilli()
    .then(x => console.debug('pouchQueue.loadSyncMilli', x))
  return pouchQueue
}

// const MobxLocalStorage = (function MobxLocalStorage() {
//   window.addEventListener('storage', function(e) {
//     console.warn('storage event', e, e.key, e.value)
//   })
//   return {}
// })()

function FirestoreChangesQueue(pouchStore) {
  ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)

  const forage = localforage.createInstance({
    name: `FirestoreChangesQueue.${pouchStore.name}`,
  })
  const fireQueue = observable(
    {
      fireQueue: observable.array([], {deep: false}),
      cRef: null,
      syncing: false,
      get syncMilliKey() {
        const name = pouchStore.name
        ow(name, ow.string.nonEmpty)
        return `sync.lastMilli`
      },
      async loadSyncMilli() {
        const seq = await forage.getItem(this.syncMilliKey)
        return ow.isValid(seq, pouchSeqPred) ? seq : 0
      },
      async setSyncTimestamp(timestamp) {
        const syncMilli = timestamp.toMillis()
        const currentSyncMilli = await this.loadSyncMilli()
        debugger

        ow(
          syncMilli,
          pouchSeqPred
            .label('syncMilli')
            .greaterThan(currentSyncMilli),
        )
        return forage.setItem(this.syncMilliKey, syncMilli)
      },
      queueFireQuerySnapshot(querySnapshot) {
        console.debug('queueFireQuerySnapshot', querySnapshot)
        this.fireQueue.push(...querySnapshot.docChanges())
        this.tryProcessingQueue()
      },

      async processChange(docChange) {
        if (!docChange) return
        this.syncing = true
        const doc = docChange.doc.data()
        if (isModifiedByLocalActor(doc)) return
        return pouchStore
          .get(doc._id)
          .then(() => {
            debugger
          })
          .catch(e => {
            console.log(e)
            pouchStore.put(doc)
          })
      },
      stopSyncing() {
        this.syncing = false
      },
      async tryProcessingQueue() {
        if (!this.cRef || this.syncing || this.fireQueue.length === 0)
          return
        const change = R.head(this.fireQueue)
        await this.processChange(change)
        await this.setSyncTimestamp(change.doc.data().serverTimestamp)
        this.fireQueue.shift()
        this.stopSyncing(change)
        await this.tryProcessingQueue()
      },
      async startQueuingChanges() {
        const since = await fireQueue.loadSyncMilli()
        this.cRef
          .where('serverTimestamp', '>', Timestamp.fromMillis(since))
          .orderBy('serverTimestamp')
          .onSnapshot(fireQueue.queueFireQuerySnapshot)
      },

      syncFromFirestore(cRef) {
        this.cRef = cRef
        this.startQueuingChanges()
        this.tryProcessingQueue()
      },
    },
    {
      queueFireQuerySnapshot: action.bound,
    },
    {name: `FirestoreChangesQueue: ${pouchStore.name}`},
  )
  fireQueue
    .loadSyncMilli()
    .then(x => console.debug('fireQueue.loadSyncMilli', x))
  return fireQueue
}
