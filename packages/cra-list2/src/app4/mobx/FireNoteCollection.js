/*eslint-disable*/

import {
  createObservableObject,
  Disposers,
  mAutoRun,
  mReaction,
  mTrace,
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

/*eslint-enable*/
/*eslint-disable no-empty-pattern, no-unused-vars*/

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

function mergeServerTimestamp(n) {
  return _.merge(n, {
    serverTimestamp: firestoreServerTimestamp(),
  })
}

function update(cRef) {
  const {locallyModifiedList} = this
  console.log(
    `[ToFire] locallyModifiedList.length`,
    locallyModifiedList.length,
  )
  const lastModifiedAt = this.lastModifiedAt

  function getLocalModifications(n) {
    const localUpdates = _.path(['actorUpdates', localActorId], n)
    let modifications = _.compose(
      _.merge(_.__, {[`actorUpdates.${localActorId}`]: localUpdates}),
      _.pick(_.__, n),
      _.keys,
      _.filter(modifiedAt => modifiedAt > lastModifiedAt),
    )(localUpdates)
    // console.log(`modifications`, modifications)
    return modifications
  }

  if (!_.isEmpty(locallyModifiedList)) {
    const pResults = locallyModifiedList.map(n => {
      const docRef = cRef.doc(n.id)
      if (n.createdAt > lastModifiedAt) {
        const newData = mergeServerTimestamp(n)
        console.log(`newData`, newData)
        return docRef.set(newData)
      } else {
        const updatedData = _.compose(
          mergeServerTimestamp,
          getLocalModifications,
        )(n)
        console.log(`updatedData`, updatedData)
        return docRef.update(updatedData)
      }
    })
    Promise.all(pResults).then(results => {
      console.debug(
        `[ToFire] update firestore results`,
        results.length,
      )
      this.setLastModifiedAt(_.last(locallyModifiedList).modifiedAt)
    })
  }
}

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
      update: debounce(update, 5000),
    },
    name: 'syncToFirestore',
  })

  return mAutoRun(
    () => {
      if (sync.locallyModifiedList.length > 0) {
        sync.update(cRef)
      }
    },
    {name: 'syncToFirestore.update'},
  )
}

function syncFromFirestore(nc, cRef) {
  const withQuerySnapshot = qs => {
    console.debug('[FromFire] withQuerySnapshot called')

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
      console.log(
        `[FromFire] remoteChanges.length`,
        remoteChanges.length,
      )
      const dataList = remoteChanges.map(dcData)
      nc.upsertListFromExternalStore(dataList)

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

export function startFireNoteCollectionSync({fire, nc}) {
  const disposers = Disposers()
  const syncDisposer = mAutoRun(
    () => {
      disposers.dispose()
      if (fire.auth.isSignedIn) {
        console.log('startFireNoteCollectionSync')
        const cRef = fire.store.createUserCollectionRef(
          'bookmarkNotes',
        )

        disposers.push(
          // syncFromFirestore(nc, cRef),
          syncToFirestore(nc, cRef),
        )
      }
    },
    {name: 'FireNoteCollection.startFireNoteCollectionSync'},
  )
  return () => {
    disposers.dispose()
    syncDisposer()
  }
}
