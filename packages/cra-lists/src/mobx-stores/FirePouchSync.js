import {FirebaseStore} from './FirebaseStore'
import {observable, reaction, runInAction} from 'mobx'
const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp

export function FirePouchSync(pc) {
  const fireSync = observable(
    {syncMilli: 0, syncSeq: 0, syncing: false},
    {},
    {name: `PouchFireSync: ${pc.name}`},
  )
  reaction(
    () => [FirebaseStore.user, fireSync.syncing],
    async () => {
      if (FirebaseStore.user && !fireSync.syncing) {
        fireSync.syncing = true
        try {
          const cRef = FirebaseStore.getUserCollectionRef(pc.name)
          const qs = await cRef
            .where(
              'serverTimestamp',
              '>',
              Timestamp.fromMillis(fireSync.syncMilli),
            )
            .get()
          console.log('qs.metadata', qs.metadata)
          console.log('qs.docs', qs.docs, qs.docChanges())

          const pChanges = await pc.pouchStore.changes({
            since: fireSync.syncSeq,
          })
          console.log('pc.pouchStore.changes', pChanges)
        } finally {
          runInAction(() => (fireSync.syncing = true))
        }
      }
    },
  )
  return fireSync
}
