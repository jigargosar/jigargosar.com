import {mWhen} from './utils'
import {storage} from '../services/storage'
import {_, validate} from '../utils'
import {
  firestoreServerTimestamp,
  zeroFirestoreTimestamp,
} from './Fire'
import {localActorId} from '../services/ActorId'

function dcData(c) {
  return c.doc.data()
}

const StorageItem = ({name, getInitial, postLoad = _.identity}) => {
  validate('SFF', [name, getInitial, postLoad])

  const getItem = () => storage.get(name)
  const setItem = val => storage.set(name, val)

  if (_.isNil(getItem())) {
    setItem(getInitial())
  }

  return {
    save: setItem,
    load: getItem,
  }
}

const lastModifiedAt = StorageItem({
  name: 'bookmarkNotes.lastModifiedAt',
  getInitial: _.always(0),
})

export function FireNoteCollection({fire, nc}) {
  async function startSync() {
    const cRef = fire.store.createUserCollectionRef('bookmarkNotes')
    const locallyModifiedList = nc.getLocallyModifiedSince(
      lastModifiedAt.load(),
    )

    console.log(
      `locallyModifiedList.length`,
      locallyModifiedList.length,
    )

    if (!_.isEmpty(locallyModifiedList)) {
      const pResults = locallyModifiedList.map(n =>
        cRef
          .doc(n.id)
          .set(
            _.merge(n, {serverTimestamp: firestoreServerTimestamp()}),
          ),
      )
      const results = await Promise.all(pResults)
      console.log(`update firestore results`, results.length)
      lastModifiedAt.set(_.last(locallyModifiedList).modifiedAt)
    }

    const syncedTillFirestoreTimestamp = _.defaultTo(
      zeroFirestoreTimestamp,
      storage.get('bookmarkNotes.syncedTillFirestoreTimestamp'),
    )

    const withQuerySnapshot = qs => {
      // console.log(`qs`, qs)
      const docChanges = qs.docChanges()
      console.debug(`qs.docChanges()`, docChanges)

      console.log(`docChanges.length`, docChanges.length)
      if (docChanges.length > 0) {
        docChanges.forEach(c => {
          console.debug(`c.doc.data()`, c.doc.data())
        })

        const remoteChanges = docChanges.filter(
          c => !_.equals(dcData(c).actorId, localActorId),
        )
        console.log(`remoteChanges.length`, remoteChanges.length)
        remoteChanges.map(dcData).map(nc.upsertFromExternalStore)

        const lastServerTimestamp = _.compose(
          _.prop('serverTimestamp'),
          dcData,
          _.last,
        )(docChanges)
        storage.set(
          'bookmarkNotes.syncedTillFirestoreTimestamp',
          lastServerTimestamp,
        )
      }
    }

    const qs = await cRef
      .where('serverTimestamp', '>', syncedTillFirestoreTimestamp)
      .orderBy('serverTimestamp', 'asc')
      .get()
    // .onSnapshot(withQuerySnapshot)
    withQuerySnapshot(qs)
  }

  mWhen(() => fire.auth.isSignedIn, startSync)
}
