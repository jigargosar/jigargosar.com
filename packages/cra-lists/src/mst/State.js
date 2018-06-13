import {
  flow,
  getEnv,
  getRoot,
  getSnapshot,
  types,
} from 'mobx-state-tree'
import {observable, reaction} from 'mobx'
import {SF} from '../safe-fun'
import PouchDB from 'pouchdb-browser'
import Kefir from 'kefir'
import {LocalStorageItem} from '../local-storage-item'
import {Fire} from './Fire'
import {addDisposer, addSubscriptionDisposer} from './mst-utils'
import firebase from 'firebase/app'
import {updateFirestoreFromPouchDoc} from './UpdateFirestore'
import {PouchCollectionStore} from '../mobx-stores/PouchCollectionStore'

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
        self.__db
          .changes({include_docs: true})
          .on('complete', self._onPouchDBChangesComplete)
      },
      _updateFromPDBChange(change) {
        self.__idLookup.put(change.doc)
      },
      _onPouchDBChangesComplete({results, last_seq}) {
        log.debug('_onPouchDBChangesComplete', results, last_seq)
        R.forEach(self._updateFromPDBChange, results)
        addSubscriptionDisposer(
          self,
          createPouchDBChangesStream(
            {live: true, include_docs: true, since: last_seq},
            self.__db,
          )
            .map(
              R.tap(change =>
                log.debug(
                  'update idLookup from pdb change',
                  change.doc,
                ),
              ),
            )
            .observe({value: self._updateFromPDBChange}),
        )
      },
      __putInDB(modelProps) {
        return self.__db.put(
          getSnapshot(Model.create(modelProps, getEnv(self))),
        )
      },
      _putInDBIgnoringFirebaseUpdate(modelProps) {
        const snapshot = getSnapshot(
          Model.create(modelProps, getEnv(self)),
        )
        const finalModel = R.merge(snapshot, {
          ignoreFirebaseUpdate: true,
        })
        log.debug('_putInDBIgnoringFirebaseUpdate', finalModel)
        return self.__db.put(finalModel)
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
        async __syncFirestoreChangeToPDB(firestoreChange) {
          const changeDoc = firestoreChange.doc
          const fireData = changeDoc.data()

          log.debug(
            'sync downstream: firestoreChange',
            changeDoc.id,
            changeDoc.metadata,
            fireData,
            firestoreChange,
          )

          const remoteModel = Model.create(fireData, getEnv(self))

          const docResult = await pReflect(
            self.__db.get(changeDoc.id),
          )

          log.debug(
            'sync downstream: get pdbDoc result',
            docResult.isRejected ? docResult.reason : docResult.value,
          )

          if (docResult.isRejected) {
            return self._putInDBIgnoringFirebaseUpdate(remoteModel)
          } else {
            const localModel = Model.create(
              docResult.value,
              getEnv(self),
            )
            // const isLocallyModified = R.equals(
            //   fireData.actorId,
            //   self.localAppActorId,
            // )
            // if (
            //   isLocallyModified &&
            //   !fireData.version > localModel.version
            // ) {
            //   log.debug(
            //     'ignoring firebase change since ' +
            //       'it is from localAppActorId, and version is not greater',
            //   )
            //   return
            // }
            // if (remoteModel.modifiedAt > localModel.modifiedAt) {
            if (remoteModel.version > localModel.version) {
              return self._putInDBIgnoringFirebaseUpdate(
                R.merge(remoteModel, R.pick(['_rev'], localModel)),
              )
            } else {
              log.warn(
                'ignoring firebase change, ' +
                  'since there is no version update',
              )
            }
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
const EditState = function() {
  return observable(
    {
      type: 'idle',
      doc: null,
      form: null,
    },
    {},
    {name: 'EditState'},
  )
}
export const State = types
  .model('RootState', {
    pageTitle: 'CRA List Proto',
    grains: types.optional(PFGrainCollection, {}),
    fire: types.optional(Fire, {}),
  })
  .volatile(() => {
    return {
      g: PouchCollectionStore('grain'),
      editState: EditState(),
    }
  })
  .views(self => {
    return {
      // get grainsList() {
      //   return self.grains.list
      // },
      get grainsList() {
        return self.g.list
      },
    }
  })
  .actions(self => {
    return {
      afterCreate() {
        self.g.load()
      },
      onAddNew() {
        return self.g.upsert({text: `${Math.random()}`})
      },
      // onUpdate(grain) {
      //   return () => self.grains.update(grain)
      // },
      update: flow(function*(doc, change) {
        self.editState = {type: 'saving', doc, form: change}
        try {
          yield self.g.upsert(R.merge(doc, change))
          self.editState = {type: 'idle'}
        } catch (e) {
          self.editState.type = 'error'
          console.warn('Update failed', self.editState, e)
        }
      }),
      onUpdate(doc) {
        return () => self.update(doc, {text: `${Math.random()}`})
      },
      startEdit(doc) {
        self.editState = {
          type: 'editing',
          doc,
          form: {text: doc.text},
        }
      },
      onStartEditing(doc) {
        return () => self.startEdit(doc)
      },
      onToggleArchive(doc) {
        return () =>
          self.update(doc, {
            isArchived: !R.propOr(false, 'isArchived', doc),
          })
      },
    }
  })
