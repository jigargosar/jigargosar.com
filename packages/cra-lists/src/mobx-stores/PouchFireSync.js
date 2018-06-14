import {FirebaseStore} from './FirebaseStore'
import {observable, reaction} from 'mobx'
const firebase = require('firebase/app')
const Timestamp = firebase.firestore.Timestamp

export function PouchFireSync(pc) {
  const pouchFireSync = observable(
    {syncMilli: 0, syncSeq: 0},
    {},
    {name: `PouchFireSync: ${pc.name}`},
  )
  reaction(
    () => FirebaseStore.user,
    async () => {
      if (FirebaseStore.user) {
        const cRef = FirebaseStore.getUserCollectionRef(pc.name)
        const qs = await cRef
          .where(
            'serverTimestamp',
            '>',
            Timestamp.fromMillis(pouchFireSync.syncMilli),
          )
          .get()
        console.log('qs.docChanges()', qs.docChanges())
        console.log('qs.docs', qs.docs)

        const pChanges = await pc.pouchStore.changes({since: 0})
        console.log('pc.changes({since:0})', pChanges)
      }
    },
  )
  return pouchFireSync
}
