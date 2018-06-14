import {FirebaseStore} from './FirebaseStore'
import {observable, reaction, action} from 'mobx'
const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp

export function FirePouchSync(pc) {
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
    },
    {queueFireSnapshot: action.bound, queuePouchChange: action.bound},
    {name: `PouchFireSync: ${pc.name}`},
  )
  reaction(
    () => [FirebaseStore.user, fireSync.syncing],
    async () => {
      if (FirebaseStore.user && !fireSync.syncing) {
        let snapshotDisposer, changes
        try {
          fireSync.syncing = true
          const cRef = FirebaseStore.getUserCollectionRef(pc.name)
          snapshotDisposer = await cRef
            .where(
              'serverTimestamp',
              '>',
              Timestamp.fromMillis(fireSync.syncMilli),
            )
            .onSnapshot(snapshot => fireSync.queueFireSnapshot)

          changes = await pc.pouchStore
            .liveChanges({
              since: fireSync.syncSeq,
            })
            .on('change', fireSync.queuePouchChange)
        } catch (e) {
          console.error(e)
          if (snapshotDisposer) snapshotDisposer()
          if (changes) changes.cancel()
          // runInAction(() => (fireSync.syncing = false))
        } finally {
          // runInAction(() => (fireSync.syncing = true))
        }
      }
    },
  )
  return fireSync
}
