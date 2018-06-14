import {FirebaseStore} from './FirebaseStore'
import {action, observable, reaction} from 'mobx'
import ow from 'ow'
import {getAppActorId} from '../LocalStorage'

const R = require('ramda')

const firebase = require('firebase/app')
// const Timestamp = firebase.firestore.Timestamp
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
    },
    {queueFireSnapshot: action.bound},
    {name: `PouchFireSync: ${pouchStore.name}`},
  )
  reaction(
    () => [FirebaseStore.user, fireSync.syncing],
    async () => {
      if (FirebaseStore.user && !fireSync.syncing) {
        let snapshotDisposer, changes
        try {
          fireSync.syncing = true
          const cRef = FirebaseStore.getUserCollectionRef(
            pouchStore.name,
          )
          fireSync.pouchChangesQueue.syncToFirestore(cRef)
          // snapshotDisposer = await cRef
          //   .where(
          //     'serverTimestamp',
          //     '>',
          //     Timestamp.fromMillis(fireSync.syncMilli),
          //   )
          //   .onSnapshot(snapshot => fireSync.queueFireSnapshot)
          //
          // changes = await pouchStore
          //   .liveChanges({
          //     since: fireSync.syncSeq,
          //   })
          //   .on('change', fireSync.queuePouchChange)
        } catch (e) {
          console.error(e)
          if (snapshotDisposer) snapshotDisposer()
          if (changes) changes.cancel()
        }
      }
    },
  )
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
const isNewer = function isNewer(doc1, doc2) {
  ow(doc1.modifiedAt, nowPredicate)
  ow(doc2.modifiedAt, nowPredicate)
  return doc1.modifiedAt > doc2.modifiedAt
}

const isOlder = function isOlder(doc1, doc2) {
  ow(doc1.modifiedAt, nowPredicate)
  ow(doc2.modifiedAt, nowPredicate)
  return doc1.modifiedAt < doc2.modifiedAt
}

function shouldSkipFirestoreSync(doc) {
  return doc.skipFirestoreSync
}

function PouchChangesQueue(pouchStore) {
  ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)

  const forage = localforage.createInstance({
    name: `PouchChangesQueue.${pouchStore.name}`,
  })
  const pouchQueue = observable(
    {
      pouchQueue: observable.array([], {deep: false}),
      cRef: null,
      syncing: false,
      get syncSeqKey() {
        const name = pouchStore.name
        ow(name, ow.string.nonEmpty)
        return `sync.lastSeq`
      },
      async loadSyncSeq() {
        const seq = await forage.getItem(this.syncSeqKey)
        return ow.isValid(seq, pouchSeqPred) ? seq : 0
      },
      async setSyncSeq(syncSeq) {
        const currentSyncSeq = await this.loadSyncSeq()
        ow(
          syncSeq,
          pouchSeqPred.label('syncSeq').greaterThan(currentSyncSeq),
        )
        return forage.setItem(this.syncSeqKey, syncSeq)
      },
      queuePouchChange(change) {
        console.debug('queuePouchChange', change)
        this.pouchQueue.push(change)
        this.tryProcessingQueue()
      },

      async startQueuingChanges() {
        const since = await pouchQueue.loadSyncSeq()
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

          function transactionSetDocWithTimestamp() {
            return transaction.set(
              docRef,
              R.merge(change.doc, {
                serverTimestamp: serverTimestamp(),
              }),
            )
          }

          function transactionEmptyUpdate() {
            return transaction.set(docRef, {})
          }

          if (!snap.exists) {
            return transactionSetDocWithTimestamp()
          }
          const firestoreDoc = snap.data()

          if (isModifiedByLocalActor(firestoreDoc)) {
            // firestore was locally modified.
            // we shouldn't blindly push, unless local version is newer
            if (isOlder(doc, firestoreDoc)) {
              return transactionEmptyUpdate()
            } else {
              return transactionSetDocWithTimestamp()
            }
          } else {
            if (isOlder(doc, firestoreDoc)) {
              debugger // should local doc be put in history?
            } else {
              debugger // should remote doc be put in history?
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
        await this.setSyncSeq(change.seq)
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
    .loadSyncSeq()
    .then(x => console.debug('pouchQueue.loadSyncSeq', x))
  return pouchQueue
}

// const MobxLocalStorage = (function MobxLocalStorage() {
//   window.addEventListener('storage', function(e) {
//     console.warn('storage event', e, e.key, e.value)
//   })
//   return {}
// })()
