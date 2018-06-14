import {FirebaseStore} from './FirebaseStore'
import {observable, reaction, action, autorun} from 'mobx'
import ow from 'ow'

const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp
const pouchSeqPred = ow.number.integer
  .label('pouch.seq')
  .greaterThanOrEqual(0)

export function FirePouchSync(pouchStore) {
  const fireSync = observable(
    {
      syncMilli: 0,
      syncSeq: 0,
      syncing: false,
      fireQueue: [],
      pouchQueue: [],
      queueFireSnapshot(snapshot) {
        this.fireQueue.push(snapshot)
      },
      queuePouchChange(change) {
        this.pouchQueue.push(change)
      },
      pcq: PouchChangesQueue(pouchStore),
    },
    {queueFireSnapshot: action.bound, queuePouchChange: action.bound},
    {name: `PouchFireSync: ${pouchStore.name}`},
  )
  reaction(
    () => [FirebaseStore.user, fireSync.syncing],
    async () => {
      if (FirebaseStore.user && !fireSync.syncing) {
        let snapshotDisposer, changes
        try {
          fireSync.syncing = true
          // const cRef = FirebaseStore.getUserCollectionRef(
          //   pouchStore.name,
          // )
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

function PouchChangesQueue(pouchStore) {
  ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)
  const pouchQueue = observable(
    {
      get syncSeqKey() {
        const name = pouchStore.name
        ow(name, ow.string.nonEmpty)
        return `${name}.sync.lastSeq`
      },
      loadSyncSeq() {
        const seq = JSON.parse(
          window.localStorage.getItem(this.syncSeqKey),
        )
        return ow.isValid(seq, pouchSeqPred) ? seq : 0
      },
      set syncSeq(syncSeq) {
        ow(
          syncSeq,
          pouchSeqPred
            .label('syncSeq')
            .greaterThan(this.loadSyncSeq()),
        )
        window.localStorage.setItem(this.syncSeqKey, syncSeq)
      },
      pouchQueue: [],
      queuePouchChange(change) {
        this.pouchQueue.push(change)
      },
    },
    {queuePouchChange: action.bound},
    {name: `PouchChangesQueue: ${pouchStore.name}`},
  )
  pouchStore
    .liveChanges({since: pouchQueue.loadSyncSeq()})
    .on('change', pouchQueue.queuePouchChange)
  console.warn('pouchQueue.loadSyncSeq', pouchQueue.loadSyncSeq())
  return pouchQueue
}
