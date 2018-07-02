import {mWhen} from './utils'
import {localActorId} from '../services/ActorId'
import {storage} from '../services/storage'
import {_} from '../utils'

export function FireNoteCollection({fire, nc}) {
  async function startSync() {
    const cRef = fire.store.createUserCollectionRef('bookmarkNotes')
    const syncedTillTimestamp = _.defaultTo(
      0,
      storage.get('bookmarkNotes.syncedTillTimestamp'),
    )
    const locallyModifiedList = nc.getLocallyModifiedSince(
      syncedTillTimestamp,
    )

    if (!_.isEmpty(locallyModifiedList)) {
      const pResults = locallyModifiedList.map(n =>
        cRef.doc(n.id).set(n),
      )
      const results = await Promise.all(pResults)
      console.log(`update firestore results`, results)
      storage.set(
        'bookmarkNotes.syncedTillTimestamp',
        _.last(locallyModifiedList).modifiedAt,
      )
    }

    cRef.where('actorId', '>', localActorId).onSnapshot(qs => {
      // console.log(`qs`, qs)
      console.log(`qs.docChanges()`, qs.docChanges())
    })
  }

  mWhen(() => fire.auth.isSignedIn, startSync)
}
