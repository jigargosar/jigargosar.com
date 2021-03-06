/*eslint-disable*/

import {
  createObservableObject,
  mAutoRun,
  mFlow,
  mReaction,
  mTrace,
} from './utils'
import {storage} from '../services/storage'
import {_, tryCatchLogError, validate} from '../utils'
import {
  createFirestoreTimestamp,
  firestoreServerTimestamp,
  zeroFirestoreTimestamp,
} from './Fire'
import {localActorId} from '../services/ActorId'
import debounce from 'lodash/debounce'
import {nanoid} from '../model/util'

/*eslint-enable, eslint-disable no-empty-pattern*/

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

function update(cRef) {
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
      // get updateFn() {
      //   return debounce(update, 5000)
      // },
    },
    actions: {
      setLastModifiedAt(val) {
        this.lastModifiedAt = val
        lastModifiedAt.save(val)
      },
      // update(cref) {
      //   this.updateFn(cref)
      // },
      update: update,
    },
  })

  sync.update(cRef)
  const iReactionDisposer = mReaction(
    () => [sync.locallyModifiedList],
    () => sync.update(cRef),
    {
      name: 'syncToFirestore',
      // equals: (a, b) => {
      //   const equalsResult = _.equals(a, b)
      //   debugger
      //   return equalsResult
      // },
    },
  )
  mTrace(iReactionDisposer)
  // iReactionDisposer()
  return iReactionDisposer
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
  //   module.hot.dispose(
  //     tryCatchLogError(() => {
  //       disposer()
  //     }),
  //   )
  // }
  return disposer
}

function Disposers() {
  const list = []
  return {
    push: (...args) => list.push(...args),
    dispose: () => {
      list.forEach(_.call)
      list.splice(0, list.length)
    },
    length: () => list.length,
  }
}

export function startFireNoteCollectionSync({fire, nc}) {
  const disposers = Disposers()
  const arDisposer = mAutoRun(
    r => {
      mTrace(r)
      disposers.dispose()
      if (fire.auth.isSignedIn) {
        console.log('startSync')
        // console.log('startSync')
        // console.log('startSync')
        const cRef = fire.store.createUserCollectionRef(
          'bookmarkNotes',
        )

        disposers.push(
          syncFromFirestore(nc, cRef),
          syncToFirestore(nc, cRef),
        )
      }
    },
    {name: 'FireNoteCollection sync ar'},
  )
  return () => {
    disposers.dispose()
    arDisposer()
  }
}

// if (module.hot) {
//   module.hot.dispose(
//     tryCatchLogError(() => {
//       console.clear()
//       // console.log('disposing', disposers.length())
//       // disposers.dispose()
//     }),
//   )
// }
