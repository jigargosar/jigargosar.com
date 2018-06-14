import {FirebaseStore} from './FirebaseStore'
import {observable, reaction, action, autorun} from 'mobx'
import ow from 'ow'
import {getAppActorId} from '../LocalStorage'

const R = require('ramda')

const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp
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

function PouchChangesQueue(pouchStore) {
  ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)

  const forage = localforage.createInstance({
    name: `${PouchChangesQueue}.${pouchStore.name}`,
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
      set syncSeq(syncSeq) {
        ow(
          syncSeq,
          pouchSeqPred
            .label('syncSeq')
            .greaterThan(this.loadSyncSeq()),
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
      processChange(change) {
        const doc = change.doc
        if (isRemotelyModified(doc)) return
        debugger
      },
      tryProcessingQueue() {
        if (!this.cRef || this.syncing) return
        const change = R.head(this.pouchQueue)
        if (change) {
          this.syncing = true
          this.processChange(change)
        }
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
