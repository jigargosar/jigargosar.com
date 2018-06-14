import {FirebaseStore} from './FirebaseStore'
import {action, observable, reaction} from 'mobx'
import ow from 'ow'
import {getAppActorId} from '../LocalStorage'

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

function isRemotelyModified(doc) {
  ow(doc.actorId, ow.string.label('doc.actorId').nonEmpty)
  return !R.equals(doc.actorId, getAppActorId())
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
        if (shouldSkipFirestoreSync(doc) || isRemotelyModified(doc))
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

          if (snap.exists) {
            const fireDoc = snap.data()
            if (isRemotelyModified(fireDoc)) {
              debugger
            } else {
              return transactionSetDocWithTimestamp()
            }
          } else {
            return transactionSetDocWithTimestamp()
          }
        })
        await this.changeProcessed(change)
      },
      async changeProcessed(change) {
        this.pouchQueue.shift()
        this.syncing = false
        await this.setSyncSeq(change.seq)
        this.tryProcessingQueue()
      },
      tryProcessingQueue() {
        if (
          !this.cRef ||
          this.syncing ||
          this.pouchQueue.length === 0
        )
          return
        this.processChange(R.head(this.pouchQueue))
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

const MobxLocalStorage = (function MobxLocalStorage() {
  window.addEventListener('storage', function(e) {
    console.warn('storage event', e, e.key, e.value)
  })
  return {}
})()
