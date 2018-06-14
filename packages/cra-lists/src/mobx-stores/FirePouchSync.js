import {FirebaseStore} from './FirebaseStore'
import {observable, reaction, action, autorun} from 'mobx'
import ow from 'ow'

const localStorageX = require('mobx-localstorage').default

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
          const cRef = FirebaseStore.getUserCollectionRef(
            pouchStore.name,
          )
          snapshotDisposer = await cRef
            .where(
              'serverTimestamp',
              '>',
              Timestamp.fromMillis(fireSync.syncMilli),
            )
            .onSnapshot(snapshot => fireSync.queueFireSnapshot)

          changes = await pouchStore
            .liveChanges({
              since: fireSync.syncSeq,
            })
            .on('change', fireSync.queuePouchChange)
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

function PouchChangesQueue(pouchStore) {
  ow(pouchStore.name, ow.string.label('pouchStore.name').nonEmpty)
  const pouchQueue = observable(
    {
      get syncSeqKey() {
        const name = pouchStore.name
        ow(name, ow.string.nonEmpty)
        return `${name}.sync.lastSeq`
      },
      get syncSeq() {
        const seq = localStorageX.getItem(this.syncSeqKey)
        return ow.isValid(seq, pouchSeqPred) ? seq : 0
      },
      set syncSeq(syncSeq) {
        ow(
          syncSeq,
          pouchSeqPred.label('syncSeq').greaterThan(this.syncSeq),
        )
        localStorageX.setItem(this.syncSeqKey, syncSeq)
      },
      queue: [],
      queuePouchChange(change) {
        this.queue.push(change)
      },
    },
    {queuePouchChange: action.bound},
    {name: `PouchChangesQueue: ${pouchStore.name}`},
  )
  autorun(() => {
    console.error(pouchQueue.syncSeq)
  })
  // pouchQueue.syncSeq = 3
  // console.warn('pouchQueue.syncSeq', pouchQueue.syncSeq)
  // console.warn('pouchQueue.syncSeqKey', pouchQueue.syncSeqKey)
  return pouchQueue
}
