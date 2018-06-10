import {getEnv, getRoot, getSnapshot, types} from 'mobx-state-tree'
import {reaction} from 'mobx'
import {SF} from '../safe-fun'
import PouchDB from 'pouchdb-browser'
import Kefir from 'kefir'
import {LocalStorageItem} from '../local-storage-item'
import {Fire} from './Fire'
import {addDisposer, addSubscriptionDisposer} from './mst-utils'
import firebase from 'firebase/app'
import {updateFirestoreFromPouchDoc} from './UpdateFirestore'

require('firebase/auth')
require('firebase/firestore')

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
      get allValues() {
        return Array.from(self.__idLookup.values())
      },
      get localAppActorId() {
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
        get firestoreCollectionRef() {
          return self.fire.userCollectionRef(name)
        },
        get __syncFSTimeStamp() {
          return firebase.firestore.Timestamp.fromMillis(
            self.__syncFSMilliLS.load(),
          )
        },
        get __syncFSMilli() {
          return self.__syncFSMilliLS.load()
        },
        set __syncFSTimeStamp(timestamp) {
          return self.__syncFSMilliLS.save(timestamp.toMillis())
        },
        set __syncPDBSeq(seq) {
          self.__syncPDBSeqLS.save(seq)
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
                return [self.firestoreCollectionRef]
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
            self.firestoreCollectionRef
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
            .map(snapshot => snapshot.docChanges())
            .flatten()
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
          if (
            self.__isFirestoreDocChangeEqualToModelInLookup(
              firestoreChange,
            )
          )
            return Promise.resolve()
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
              // await self.__syncPDBChangeToFirestore(pdbChange)
              await updateFirestoreFromPouchDoc({
                doc: pdbChange.doc,
                appActorId: self.localAppActorId,
                cRef: self.firestoreCollectionRef,
              })
              self.__syncPDBSeq = pdbChange.seq
            }, Promise.resolve())
            .takeErrors(1)
            .observe({
              error(error) {
                log.error('syncFromPDBToFireStore', error)
              },
            })
        },
        //<editor-fold desc="Ignored">
        async __syncPDBChangeToFirestore(pdbChange) {
          await updateFirestoreFromPouchDoc({
            doc: pdbChange.doc,
            appActorId: self.localAppActorId,
            cRef: self.firestoreCollectionRef,
          })
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

          const docRef = self.firestoreCollectionRef.doc(localDoc.id)

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
          function prepareForFirestoreSave(localDoc) {
            log.trace('sync upstream: prepareForFirestoreSave')
            return R.compose(R.merge(localDoc))({
              _rev: null,
              fireStoreServerTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
        //</editor-fold>
      }
    })
    .actions(self => ({
      addNew(extendedProps = {}) {
        assert(RA.isNotNil(extendedProps))
        const props = {
          _id: `${modelName}-${nanoid()}`,
          _rev: null,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          archived: false,
          actorId: self.localAppActorId,
          version: 0,
        }
        return self.__putInDB(R.mergeDeepRight(extendedProps, props))
      },
      update({_id, _rev}, userChange = {}) {
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
              actorId: self.localAppActorId,
            }),
          )
        }
        return Promise.resolve()
      },
    }))
}

const PFGrain = createPouchFireModel('Grain').props({
  text: types.string,
})

const PFGrainCollection = types
  .model('PFGrainCollection', {
    _collection: types.optional(
      createPouchFireCollection(PFGrain, 'Grain'),
      {},
    ),
  })
  .views(self => {
    return {
      get list() {
        const sortWithProps = [R.descend(SF.prop('createdAt'))]
        return R.sortWith(sortWithProps, self._collection.allValues)
      },
    }
  })
  .actions(self => {
    return {
      addNew() {
        self._collection.addNew({text: `${Math.random()}`})
      },
      update(grain) {
        self._collection.update(grain, {text: `${Math.random()}`})
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
    }
  })
