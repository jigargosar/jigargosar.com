// const log = require('nanologger')('rootStore')
import {addDisposer, getEnv, getSnapshot, types,} from 'mobx-state-tree'
import {SF} from './safe-fun'
import PouchDB from 'pouchdb-browser'

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

function createPouchFireCollection(Model, modelName) {
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
        self.pdb.close()
      })
      return {
        __db: pdb,
      }
    })
    .actions(self => {
      return {
        afterCreate() {
          const changes = self.__db
            .changes({
              live: true,
              include_docs: true,
            })
            .on('change', self.__loadFromPDB)
          addDisposer(self, () => changes.cancel())
        },
        __loadFromPDB(change) {
          log.debug('updating _idLookup from PDB change', change)
          self.__idLookup.put(change.doc)
        },
        __putInDB(modelProps) {
          self.__db.put(getSnapshot(Model.create(modelProps)))
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
          self.__putInDB(R.mergeDeepRight(extendedProps, props))
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

            self.__putInDB(
              R.merge(changesMergedModel, {
                modifiedAt: Date.now(),
                actorId: self._actorId,
              }),
            )
          }
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

export const State = types
  .model('RootState', {
    pageTitle: 'CRA List Proto',
    grains: types.optional(PFGrainCollection, {}),
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
