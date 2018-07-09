/*eslint-disable*/

import {
  createObservableObject,
  Disposers,
  mAutoRun,
  mJSRejectFn,
} from './little-mobx'
import {StorageItem} from '../services/storage'
import {_} from '../utils'
import {
  createFirestoreTimestamp,
  firestoreServerTimestamp,
  zeroFirestoreTimestamp,
} from './Fire'
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

const lastModifiedAt = StorageItem({
  name: 'bookmarkNotes.lastModifiedAt',
  getInitial: _.always(0),
})

const lastServerTimestamp = StorageItem({
  name: 'bookmarkNotes.lastServerTimestamp',
  getInitial: _.always(zeroFirestoreTimestamp),
  postLoad: createFirestoreTimestamp,
})

function update(cRef) {
  const {locallyModifiedList} = this
  console.log(
    `[ToFire] locallyModifiedList.length`,
    locallyModifiedList.length,
  )
  const lastModifiedAt = this.lastModifiedAt

  if (!_.isEmpty(locallyModifiedList)) {
    const pResults = locallyModifiedList.map(n => {
      const docRef = cRef.doc(n.id)
      if (n.createdAt > lastModifiedAt) {
        const newData = _.compose(
          _.merge(_.__, {
            serverTimestamp: firestoreServerTimestamp(),
          }),
          mJSRejectFn,
        )(n)
        console.log(`newData`, newData)
        return docRef.set(newData)
      } else {
        const updatedData = _.concat([
          'serverTimestamp',
          firestoreServerTimestamp(),
        ])(n.getLocalModificationsSinceAsArray(lastModifiedAt))
        console.log(`updatedData`, updatedData)
        return docRef.update(...updatedData)
      }
    })
    Promise.all(pResults).then(results => {
      console.debug(
        `[ToFire] update firestore results`,
        results.length,
      )
      this.setLastModifiedAt(
        _.last(locallyModifiedList).lastLocallyModifiedAt,
      )
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

      const dataList = docChanges.map(dcData)
      nc.upsertListFromRemoteStore(dataList)

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
          syncFromFirestore(nc, cRef),
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
