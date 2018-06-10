// const log = require('nanologger')('rootStore')
import {
  addDisposer as mstAddDisposer,
  flow,
  getEnv,
  getRoot,
  getSnapshot,
  types,
} from 'mobx-state-tree'

import {reaction} from 'mobx'
import {SF} from './safe-fun'
import PouchDB from 'pouchdb-browser'
import Kefir from 'kefir'
import {LocalStorageItem} from './local-storage-item'

const firebase = require('firebase/app')
const pReflect = require('p-reflect')

const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')
const nanoid = require('nanoid')

function omitRevAndTimestamp(obj) {
  return SF.omit(['_rev', 'fireStoreServerTimestamp'])(obj)
}

const PouchFireBaseModel = types
  .model(`PouchFireBaseModel`, {
    _id: types.identifier(types.string),
    _rev: types.maybe(types.string),
    actorId: types.string,
    version: types.number,
    createdAt: types.number,
    modifiedAt: types.number,
    archived: types.boolean,
  })
  .views(self => {
    return {
      get id() {
        return self._id
      },
      get rev() {
        return self._rev
      },
      get hasLocalAppActorId() {
        const localAppActorId = getEnv(self).localAppActorId
        assert(RA.isNotEmpty(localAppActorId))
        return localAppActorId === self.actorId
      },
      isEqualToFirestoreDocChange(docChange) {
        return R.equals(
          omitRevAndTimestamp(self),
          omitRevAndTimestamp(docChange.doc.data()),
        )
      },
    }
  })

function createPouchFireModel(name) {
  return PouchFireBaseModel.named(`PouchFire${name}Model`)
}

function createPouchDBChangesStream(options, pouchDB) {
  const log = require('nanologger')(`PouchDB:${pouchDB.name}`)
  log.trace('createPouchDBChangesStream', options)
  return Kefir.stream(emitter => {
    const changes = pouchDB
      .changes(options)
      .on('change', emitter.value)
      .on('error', emitter.error)
      .on('complete', emitter.end)
    return () => {
      log.trace('disposing createPouchDBChangesStream', options)
      return changes.cancel()
    }
  })
}
function addDisposer(target, disposer) {
  return mstAddDisposer(target, () => {
    try {
      disposer()
    } catch (e) {
      console.error(e)
    }
  })
}
function addSubscriptionDisposer(target, subscription) {
  return addDisposer(target, () => subscription.unsubscribe())
}

function createFirestoreOnSnapshotStream(query) {
  return Kefir.stream(emitter => {
    return query.onSnapshot(emitter.value, emitter.error, emitter.end)
  })
}

function createPouchFireCollection(Model, modelName) {
  const name = `PouchFire${modelName}Collection`
  const log = require('nanologger')(name)

  const userModifiableProps = R.without(
    PouchFireBaseModel.propertyNames,
    Model.propertyNames,
  )

  function isValidChange(userChanges) {
    return R.isEmpty(SF.omit(userModifiableProps, userChanges))
  }

  return types
    .model(name, {
      __idLookup: types.optional(types.map(Model), {}),
    })
    .views(self => ({
      get _all() {
        return Array.from(self.__idLookup.values())
      },
      get __localAppActorId() {
        const localAppActorId = getEnv(self).localAppActorId
        assert(RA.isNotEmpty(localAppActorId))
        return localAppActorId
      },
    }))
    .volatile(self => {
      log.trace('creating pdb', name)
      const pdb = new PouchDB(name)
      addDisposer(self, () => {
        log.trace('closing pdb', name)
        pdb.close()
      })
      return {
        __db: pdb,
      }
    })
    .actions(self => ({
      afterCreate() {
        addSubscriptionDisposer(
          self,
          createPouchDBChangesStream(
            {live: true, include_docs: true},
            self.__db,
          )
            .bufferWithTimeOrCount(500, 100)
            .filter(RA.isNotEmpty)
            // .spy(`${name} buffered changes`)
            .observe({value: self.__updateFromPDBBufferedChanges}),
        )
      },
      __updateFromPDBChange(change) {
        self.__idLookup.put(change.doc)
      },
      __updateFromPDBBufferedChanges(bufferedChanges) {
        log.debug(
          'updating _idLookup from PDB bufferedChanges',
          bufferedChanges,
        )
        R.forEach(self.__updateFromPDBChange, bufferedChanges)
      },
      __putInDB(modelProps) {
        return self.__db.put(
          getSnapshot(Model.create(modelProps, getEnv(self))),
        )
      },
    }))
    .volatile(self => ({
      __syncFSMilliLS: LocalStorageItem(
        `cra-list:${name}:syncedTillFirestoreMilli`,
        0,
      ),
      __syncPDBSeqLS: LocalStorageItem(
        `cra-list:${name}:syncedTillPDBSequenceNumber`,
        0,
      ),
    }))
    .views(self => {
      return {
        get fire() {
          return getRoot(self).fire
        },
        get __firestoreCollectionRef() {
          return self.fire.userCollectionRef(name)
        },
        get __firestoreCollectionPath() {
          return self.fire.userCollectionPath(name)
        },
        get __syncFSTimeStamp() {
          return self.fire.FirestoreTimestamp.fromMillis(
            self.__syncFSMilliLS.load(),
          )
        },
        get __syncFSMilli() {
          return self.__syncFSMilliLS.load()
        },
        set __syncFSTimeStamp(Timestamp) {
          return self.__syncFSMilliLS.save(Timestamp.toMillis())
        },
        set __syncPDBSeq(seq) {
          self.__syncPDBSeqLS.save(seq)
          // self._syncPDBSeqLS.save(0)
        },
        get __syncPDBSeq() {
          return self.__syncPDBSeqLS.load()
        },
      }
    })
    .actions(self => {
      const signInSubscriptions = []

      function disposeSignInSubscriptions() {
        log.trace(
          'disposeSignInSubscriptions',
          signInSubscriptions.length,
        )
        R.forEach(R.invoker(0, 'unsubscribe'), signInSubscriptions)
        log.trace(
          'disposeSignInSubscriptions complete',
          signInSubscriptions.length,
        )
        signInSubscriptions.splice(0, signInSubscriptions.length)
      }

      return {
        afterCreate() {
          addDisposer(self, disposeSignInSubscriptions)
          addDisposer(
            self,
            reaction(
              () => {
                // trace()
                return [self.__firestoreCollectionRef]
              },
              () => {
                disposeSignInSubscriptions()

                signInSubscriptions.push(self.__startDownStreamSync())
                signInSubscriptions.push(self.__startUpStreamSync())
              },
            ),
          )
        },
        __startDownStreamSync() {
          log.trace(
            '__startDownStreamSync from syncFSTimeStamp',
            self.__syncFSTimeStamp,
          )
          return createFirestoreOnSnapshotStream(
            self.__firestoreCollectionRef
              .where(
                'fireStoreServerTimestamp',
                '>',
                self.__syncFSTimeStamp,
              )
              .orderBy('fireStoreServerTimestamp'),
          )
            .bufferWithTimeOrCount(2000, 100)
            .filter(RA.isNotEmpty)
            .flatten()
            .map(
              R.tap(snapshot => {
                // log.debug('snapshot', snapshot)
              }),
            )
            .map(snapshot => snapshot.docChanges())
            .flatten()
            .filter(
              R.complement(
                self.__isFirestoreDocChangeEqualToModelInLookup,
              ),
            )
            .filter(change => {
              const serverTimestamp = change.doc.data()
                .fireStoreServerTimestamp
              assert(RA.isNotNil(serverTimestamp))
              return serverTimestamp.toMillis() > self.__syncFSMilli
            })
            .scan(async (prevPromise, firestoreChange) => {
              const firestoreTimestamp = firestoreChange.doc.data()
                .fireStoreServerTimestamp
              assert(RA.isNotNil(firestoreTimestamp))
              await prevPromise
              await self.__syncFirestoreChangeToPDB(firestoreChange)
              self.__syncFSTimeStamp = firestoreTimestamp
            }, Promise.resolve())
            .takeErrors(1)
            .observe({
              error(error) {
                log.error('syncFromPDBToFireStore', error)
              },
            })
        },
        __isFirestoreDocChangeEqualToModelInLookup(docChange) {
          const model = self.__idLookup.get(docChange.doc.id)
          if (!model) return false
          return model.isEqualToFirestoreDocChange(docChange)
        },
        async __syncFirestoreChangeToPDB(firestoreChange) {
          const changeDoc = firestoreChange.doc
          const changeDocData = changeDoc.data()

          log.debug(
            'sync downstream: firestoreChange',
            changeDoc.id,
            changeDoc.metadata,
            changeDocData,
            firestoreChange,
          )

          const remoteModel = Model.create(
            changeDocData,
            getEnv(self),
          )
          assert(R.isNil(remoteModel._rev))

          const docResult = await pReflect(
            self.__db.get(changeDoc.id),
          )

          log.debug(
            'sync downstream: get pdbDoc result',
            docResult.isRejected ? docResult.reason : docResult.value,
          )

          if (docResult.isRejected) {
            return self.__putInDB(remoteModel)
          } else {
            const localModel = Model.create(
              docResult.value,
              getEnv(self),
            )
            if (remoteModel.modifiedAt > localModel.modifiedAt) {
              return self.__putInDB(
                R.merge(remoteModel, R.pick(['_rev'], localModel)),
              )
            }
            log.debug('sync downstream: ignoring firestoreChange')
            return Promise.resolve()
          }
        },
        __startUpStreamSync() {
          const since = self.__syncPDBSeq
          log.trace('__startUpStreamSync from syncPDBSeq', since)
          return createPouchDBChangesStream(
            {
              live: true,
              include_docs: true,
              since,
            },
            self.__db,
          )
            .scan(async (prevPromise, pdbChange) => {
              await prevPromise
              await self.__syncPDBChangeToFirestore(pdbChange)
              self.__syncPDBSeq = pdbChange.seq
            }, Promise.resolve())
            .takeErrors(1)
            .observe({
              error(error) {
                log.error('syncFromPDBToFireStore', error)
              },
            })
        },
        async __syncPDBChangeToFirestore(pdbChange) {
          log.debug(
            'sync upstream: pdbChange',
            ...R.compose(
              R.values,
              R.flatten,
              R.toPairs,
              SF.omit(['changes', 'doc']),
            )(pdbChange),
            pdbChange.doc,
          )
          const localDoc = Model.create(pdbChange.doc, getEnv(self))
          if (!localDoc.hasLocalAppActorId) return

          const docRef = self.__firestoreCollectionRef.doc(
            localDoc.id,
          )

          return docRef.firestore.runTransaction(
            async transaction => {
              const remoteDocSnapshot = await transaction.get(docRef)
              if (!remoteDocSnapshot.exists) {
                transaction.set(
                  docRef,
                  prepareForFirestoreSave(localDoc),
                )
                return
              }
              const remoteDoc = Model.create(
                remoteDocSnapshot.data(),
                getEnv(self),
              )
              if (isNewerThan(remoteDoc, localDoc)) {
                log.trace('sync upstream: empty transaction update')
                transaction.update(docRef, {})
                return
              }
              if (!remoteDoc.hasLocalAppActorId) {
                addToHistory(docRef, remoteDoc, transaction)
              }
              transaction.update(
                docRef,
                prepareForFirestoreSave(localDoc),
              )
            },
          )
          // self.syncFSTimeStamp = docChange.data().fireStoreServerTimestamp
          function prepareForFirestoreSave(localDoc) {
            log.trace('sync upstream: prepareForFirestoreSave')
            const fireStoreServerTimestamp = firebase.firestore.FieldValue.serverTimestamp()
            return R.compose(R.merge(localDoc))({
              _rev: null,
              fireStoreServerTimestamp,
            })
          }

          function isNewerThan(doc1, doc2) {
            return doc1.modifiedAt > doc2.modifiedAt
          }

          function addToHistory(docRef, doc, transaction) {
            transaction.set(
              docRef.collection('history').doc(`${doc.modifiedAt}`),
              doc,
            )
          }
        },
      }
    })
    .actions(self => ({
      _addNew(extendedProps = {}) {
        assert(RA.isNotNil(extendedProps))
        const props = {
          _id: `${modelName}-${nanoid()}`,
          _rev: null,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          archived: false,
          actorId: self.__localAppActorId,
          version: 0,
        }
        return self.__putInDB(R.mergeDeepRight(extendedProps, props))
      },
      _update({_id, _rev}, userChange = {}) {
        assert(RA.isNotNil(userChange))
        const modelSnapshot = getSnapshot(self.__idLookup.get(_id))

        assert.equal(modelSnapshot._rev, _rev)

        assert(isValidChange(userChange))

        const hasActuallyChanged = !R.equals(
          modelSnapshot,
          R.merge(modelSnapshot, userChange),
        )

        if (hasActuallyChanged) {
          const changesMergedModel = R.mergeDeepRight(
            modelSnapshot,
            userChange,
          )

          return self.__putInDB(
            R.merge(changesMergedModel, {
              modifiedAt: Date.now(),
              actorId: self.__localAppActorId,
            }),
          )
        }
        return Promise.resolve()
      },
      _clear() {
        self.__idLookup.clear()
      },
    }))
}

const PFGrain = createPouchFireModel('Grain').props({
  text: types.string,
})

const PFGrainCollection = createPouchFireCollection(PFGrain, 'Grain')
  .views(self => {
    return {
      get list() {
        const sortWithProps = [R.descend(SF.prop('createdAt'))]
        return R.sortWith(sortWithProps, self._all)
      },

      clear() {
        self._clear()
      },
    }
  })
  .actions(self => {
    return {
      addNew() {
        self._addNew({text: `${Math.random()}`})
      },
      update(grain) {
        self._update(grain, {text: `${Math.random()}`})
      },
    }
  })

const omitFirebaseClutter = R.unless(
  R.isNil,
  R.pickBy(
    (val, key) =>
      !(key.length <= 2 || RA.isFunction(val) || R.head(key) === '_'),
  ),
)

const Fire = types
  .model('Fire')
  .volatile(() => ({
    authState: 'loading',
    userInfo: null,
  }))
  .views(self => {
    return {
      get app() {
        return self.firebase.apps[0]
      },
      get log() {
        return require('nanologger')('Fire')
      },
      get firebase() {
        return getEnv(self).firebase
      },
      get store() {
        return self.app.firestore()
      },
      get FirestoreTimestamp() {
        return self.firebase.firestore.Timestamp
      },
      get auth() {
        return self.app.auth()
      },
      get isAuthLoading() {
        return R.equals(self.authState, 'loading')
      },
      get isSignedIn() {
        return R.equals(self.authState, 'signedIn')
      },
      userCollectionRef(collectionName) {
        assert(RA.isNotNil(collectionName))
        if (!self.isSignedIn || R.isNil(self.store)) return null
        return self.store.collection(
          `/users/${self.uid}/${collectionName}`,
        )
      },
      userCollectionPath(collectionName) {
        assert(RA.isNotNil(collectionName))
        if (R.isNil(self.uid)) return null
        return `/users/${self.uid}/${collectionName}`
      },
      get _grainsCollectionRef() {
        assert(self.isSignedIn)
        assert(RA.isNotNil(self.store))
        return self.store.collection(`/users/${self.uid}/grains`)
      },
      get uid() {
        return R.pathOr(null, 'userInfo.uid'.split('.'))(self)
      },
    }
  })
  .actions(self => {
    return {
      afterCreate: flow(function* afterCreate() {
        var config = {
          apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
          authDomain: 'not-now-142808.firebaseapp.com',
          databaseURL: 'https://not-now-142808.firebaseio.com',
          projectId: 'not-now-142808',
          storageBucket: 'not-now-142808.appspot.com',
          messagingSenderId: '476064436883',
        }

        if (!self.app) {
          const app = self.firebase.initializeApp(config)
          const store = app.firestore()
          store.settings({timestampsInSnapshots: true})
          const result = yield pReflect(store.enablePersistence())
          self.log.trace('store enablePersistence result', result)
        }

        addDisposer(
          self,
          self.auth.onAuthStateChanged(self._onAuthStateChanged),
        )
      }),

      _onAuthStateChanged(user) {
        self.userInfo = omitFirebaseClutter(user)
        self.log.trace('onAuthStateChanged userInfo:', self.userInfo)
        self.authState = user ? 'signedIn' : 'signedOut'
      },
      signIn() {
        var provider = new firebase.auth.GoogleAuthProvider()
        provider.setCustomParameters({prompt: 'select_account'})
        return self.auth.signInWithRedirect(provider)
      },
      signOut() {
        return self.auth.signOut()
      },
    }
  })

export const State = types
  .model('RootState', {
    pageTitle: 'CRA List Proto',
    grains: types.optional(PFGrainCollection, {}),
    fire: types.optional(Fire, {}),
  })
  .views(self => {
    return {
      get grainsList() {
        return self.grains.list
      },
    }
  })
  .actions(self => {
    return {
      onAddNew() {
        return self.grains.addNew()
      },
      onUpdate(grain) {
        return () => self.grains.update(grain)
      },
      onClear() {
        return self.grains.clear()
      },
    }
  })
