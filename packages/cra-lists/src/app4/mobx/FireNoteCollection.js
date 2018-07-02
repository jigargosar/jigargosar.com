import {createObservableObject, mAutoRun, mWhen} from './utils'
import {storage} from '../services/storage'
import {_, validate} from '../utils'
import {
  createFirestoreTimestamp,
  firestoreServerTimestamp,
  zeroFirestoreTimestamp,
} from './Fire'
import {localActorId} from '../services/ActorId'

function dcData(c) {
  return c.doc.data()
}

const dcListLastServerTimestampFrom = _.compose(
  _.prop('serverTimestamp'),
  dcData,
  _.last,
)

const StorageItem = ({name, getInitial, postLoad = _.identity}) => {
  validate('SFF', [name, getInitial, postLoad])

  const getItem = () => storage.get(name)
  const setItem = val => storage.set(name, val)

  if (_.isNil(getItem())) {
    setItem(getInitial())
  }

  return {
    save: setItem,
    load: _.compose(postLoad, getItem),
  }
}

const lastModifiedAt = StorageItem({
  name: 'bookmarkNotes.lastModifiedAt',
  getInitial: _.always(0),
})

const lastServerTimestamp = StorageItem({
  name: 'bookmarkNotes.lastServerTimestamp',
  getInitial: _.always(zeroFirestoreTimestamp),
  postLoad: createFirestoreTimestamp,
})

function syncToFirestore(nc, cRef) {
  const sync = createObservableObject({
    props: {
      lastModifiedAt: lastModifiedAt.load(),
      get locallyModifiedList() {
        return nc.getLocallyModifiedSince(this.lastModifiedAt)
      },
    },
    actions: {
      setLastModifiedAt(val) {
        this.lastModifiedAt = val
        lastModifiedAt.save(val)
      },
    },
  })

  return mAutoRun(
    async () => {
      const {locallyModifiedList} = sync
      console.log(
        `[ToFire] locallyModifiedList.length`,
        locallyModifiedList.length,
      )

      if (!_.isEmpty(locallyModifiedList)) {
        const pResults = locallyModifiedList.map(n =>
          cRef.doc(n.id).set(
            _.merge(n, {
              serverTimestamp: firestoreServerTimestamp(),
            }),
          ),
        )
        const results = await Promise.all(pResults)
        console.log(
          `[ToFire] update firestore results`,
          results.length,
        )
        sync.setLastModifiedAt(_.last(locallyModifiedList).modifiedAt)
      }
    },
    {name: 'syncToFirestore'},
  )
}

function syncFromFirestore(nc, cRef) {
  const withQuerySnapshot = qs => {
    console.log('withQuerySnapshot called')

    console.debug(`qs`, qs)
    const docChanges = qs.docChanges()
    console.debug(`qs.docChanges()`, docChanges)

    console.log(`docChanges.length`, docChanges.length)
    if (docChanges.length > 0) {
      docChanges.forEach(c => {
        console.debug(`dcData(c)`, dcData(c))
      })

      const remoteChanges = docChanges.filter(
        c => !_.equals(dcData(c).actorId, localActorId),
      )
      console.log(`remoteChanges.length`, remoteChanges.length)
      remoteChanges.map(dcData).map(nc.upsertFromExternalStore)

      lastServerTimestamp.save(
        dcListLastServerTimestampFrom(docChanges),
      )
    }
  }

  const query = cRef
    .where('serverTimestamp', '>', lastServerTimestamp.load())
    .orderBy('serverTimestamp', 'asc')
  // withQuerySnapshot(await query.get())
  return query.onSnapshot(withQuerySnapshot)
}

export function FireNoteCollection({fire, nc}) {
  function startSync() {
    const cRef = fire.store.createUserCollectionRef('bookmarkNotes')
    const disposers = [
      syncFromFirestore(nc, cRef),
      syncToFirestore(nc, cRef),
    ]
    return () => {
      disposers.forEach(_.invoker(0, 'call'))
    }
  }

  mWhen(
    () => fire.auth.isSignedIn,
    () => {
      mWhen(() => fire.auth.isSignedOut, startSync())
    },
  )
}
