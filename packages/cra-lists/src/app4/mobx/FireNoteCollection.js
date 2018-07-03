import {
  createObservableObject,
  mFlow,
  mReaction,
  mWhen,
} from './utils'
import {storage} from '../services/storage'
import {_, validate} from '../utils'
import {
  createFirestoreTimestamp,
  firestoreServerTimestamp,
  zeroFirestoreTimestamp,
} from './Fire'
import {localActorId} from '../services/ActorId'
import debounce from 'lodash/debounce'

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
  const update = mFlow(function*() {
    const {locallyModifiedList} = this
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
      const results = yield Promise.all(pResults)
      console.debug(
        `[ToFire] update firestore results`,
        results.length,
      )
      this.setLastModifiedAt(_.last(locallyModifiedList).modifiedAt)
    }
  })

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
      update: debounce(update, 5000),
    },
  })
  sync.update()
  const iReactionDisposer = mReaction(
    () => sync.locallyModifiedList,
    () => sync.update(),
    {
      name: 'syncToFirestore',
    },
  )
  // mTrace(iReactionDisposer)
  return iReactionDisposer
}

function syncFromFirestore(nc, cRef) {
  const withQuerySnapshot = qs => {
    console.log('[FromFire] withQuerySnapshot called')

    console.debug(`[FromFire] qs`, qs)
    const docChanges = qs.docChanges()
    console.debug(`[FromFire] qs.docChanges()`, docChanges)

    console.debug(`[FromFire] docChanges.length`, docChanges.length)
    if (docChanges.length > 0) {
      docChanges.forEach(c => {
        console.debug(`[FromFire] dcData(c)`, dcData(c))
      })

      const remoteChanges = docChanges.filter(
        c => !_.equals(dcData(c).actorId, localActorId),
      )
      console.debug(
        `[FromFire] remoteChanges.length`,
        remoteChanges.length,
      )
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
  const disposer = query.onSnapshot(withQuerySnapshot)
  // if (module.hot) {
  //   module.hot.dispose(() => {
  //     disposer()
  //   })
  // }
  return disposer
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
      const disposer = startSync()
      if (module.hot) {
        module.hot.dispose(() => {
          disposer()
        })
      }
      mWhen(() => fire.auth.isSignedOut, disposer)
    },
  )
}
