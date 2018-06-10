// const log = require('nanologger')('rootStore')
import {addDisposer as mstAddDisposer, flow, getEnv, getRoot, getSnapshot, types,} from 'mobx-state-tree'
import {reaction} from 'mobx'
import {SF} from './safe-fun'
import PouchDB from 'pouchdb-browser'
import Kefir from 'kefir'

const firebase = require('firebase/app')
const pReflect = require('p-reflect')

const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')
const nanoid = require('nanoid')

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
    }
  })

function createPouchFireModel(name) {
  return PouchFireBaseModel.named(`PouchFire${name}Model`)
}

function pouchDBChangesStream(options, pouchDB) {
  return Kefir.stream(emitter => {
    const changes = pouchDB
      .changes(options)
      .on('change', emitter.value)
      .on('error', emitter.error)
      .on('complete', emitter.end)
    return () => changes.cancel()
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

function createPouchFireCollection(
  Model,
  modelName,
  firestoreCollectionName,
) {
  const name = `PouchFire${modelName}Collection`
  const log = require('nanologger')(name)

  const userModifiableProps = R.without(
    PouchFireBaseModel.propertyNames,
    Model.propertyNames,
  )

  function isValidChange(userChanges) {
    return R.isEmpty(R.omit(userModifiableProps, userChanges))
  }

  return types
    .model(name, {
      __idLookup: types.optional(types.map(Model), {}),
    })
    .views(self => {
      return {
        get _all() {
          return Array.from(self.__idLookup.values())
        },
        get _actorId() {
          return getEnv(self).actorId
        },
      }
    })
    .volatile(self => {
      log.warn('creating pdb', name)
      const pdb = new PouchDB(name)
      addDisposer(self, () => {
        log.warn('closing pdb', name)
        pdb.close()
      })
      return {
        __db: pdb,
      }
    })
    .actions(self => {
      return {
        afterCreate() {
          addSubscriptionDisposer(
            self,
            pouchDBChangesStream(
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
          return self.__db.put(getSnapshot(Model.create(modelProps)))
        },
      }
    })
    .views(self => {
      return {
        get fire() {
          return getRoot(self).fire
        },
      }
    })
    .actions(self => {
      const signInSubscriptions = []

      function disposeSignInSubscriptions() {
        R.forEach(R.invoker(0, 'unsubscribe'), signInSubscriptions)
        signInSubscriptions.splice(0, signInSubscriptions.length)
      }

      return {
        afterCreate() {
          addDisposer(self, disposeSignInSubscriptions)
          addDisposer(
            self,
            reaction(
              () => [
                self.fire.userCollectionRef(firestoreCollectionName),
              ],
              ([ucr]) => {
                disposeSignInSubscriptions()
                if (R.isNil(ucr)) return

                signInSubscriptions.push(
                  createFirestoreOnSnapshotStream(ucr).observe({
                    value: self._onFirestoreCollectionSnapshot,
                  }),
                )
              },
            ),
          )
        },
        _onFirestoreCollectionSnapshot(snapshot) {
          const docChanges = snapshot.docChanges()
          log.debug('fire: snapshot.docChanges()', docChanges)
          R.forEach(self._onFirestoreCollectionChange, docChanges)
        },
        _onFirestoreCollectionChange(docChange) {
          log.debug('fire: docChange', docChange)
        },
      }
    })
    .actions(self => {
      return {
        _addNew(extendedProps = {}) {
          assert(RA.isNotNil(extendedProps))
          const props = {
            _id: `${modelName}-${nanoid()}`,
            _rev: null,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            archived: false,
            actorId: self._actorId,
            version: 0,
          }
          return self.__putInDB(
            R.mergeDeepRight(extendedProps, props),
          )
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
                actorId: self._actorId,
              }),
            )
          }
          return Promise.resolve()
        },
        _clear() {
          self.__idLookup.clear()
        },
      }
    })
}

const PFGrain = createPouchFireModel('Grain').props({
  text: types.string,
})

const PFGrainCollection = createPouchFireCollection(
  PFGrain,
  'Grain',
  'grains',
)
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
  .volatile(self => {
    const log = require('nanologger')('Fire')
    var config = {
      apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
      authDomain: 'not-now-142808.firebaseapp.com',
      databaseURL: 'https://not-now-142808.firebaseio.com',
      projectId: 'not-now-142808',
      storageBucket: 'not-now-142808.appspot.com',
      messagingSenderId: '476064436883',
    }

    const isAppInitialized = !R.isEmpty(firebase.apps)

    if (!isAppInitialized) firebase.initializeApp(config)

    return {
      app: firebase,
      store: isAppInitialized ? firebase.firestore() : null,
      auth: firebase.auth(),
      userInfo: null,
      authState: 'loading',
      log,
    }
  })
  .views(self => {
    return {
      get isAuthLoading() {
        return R.equals(self.authState, 'loading')
      },
      get isSignedIn() {
        return R.equals(self.authState, 'signedIn')
      },
    }
  })
  .views(self => ({
    userCollectionRef(collectionName) {
      assert(RA.isNotNil(collectionName))
      if (!self.isSignedIn || R.isNil(self.store)) return null
      return self.store.collection(
        `/users/${self.uid}/${collectionName}`,
      )
    },
    get _grainsCollectionRef() {
      assert(self.isSignedIn)
      assert(RA.isNotNil(self.store))
      return self.store.collection(`/users/${self.uid}/grains`)
    },
    get uid() {
      assert(self.isSignedIn)
      return self.userInfo.uid
    },
  }))
  .actions(self => {
    return {
      afterCreate: flow(function* afterCreate() {
        addDisposer(
          self,
          reaction(
            () => self.store,
            () => {
              self.log.debug('storeReady', RA.isNotNil(self.store))
            },
          ),
        )

        addDisposer(
          self,
          self.auth.onAuthStateChanged(self._onAuthStateChanged),
        )

        if (!self.store) {
          const store = self.app.firestore()
          store.settings({timestampsInSnapshots: true})
          const result = yield pReflect(store.enablePersistence())
          self.log.debug('store enablePersistence result', result)
          self.store = store
        }
      }),

      _onAuthStateChanged(user) {
        self.userInfo = omitFirebaseClutter(user)
        self.log.debug('onAuthStateChanged userInfo:', self.userInfo)
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
      get actorId() {
        return getEnv(self).actorId
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
