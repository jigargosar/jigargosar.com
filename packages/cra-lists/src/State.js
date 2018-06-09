// const log = require('nanologger')('rootStore')
import {addDisposer, getEnv, types} from 'mobx-state-tree'
import {SF} from './safe-fun'
import PouchDB from 'pouchdb-browser'

const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')
const nanoid = require('nanoid')

function createPouchFireModel(name) {
  return types
    .model(`PouchFire${name}Model`, {
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
      }
    })
}

function createPouchFireCollection(Model, modelName) {
  const name = `PouchFire${modelName}Collection`
  const log = require('nanologger')(name)
  return types
    .model(name, {
      __idLookup: types.optional(types.map(Model), {}),
    })
    .views(self => {
      return {
        get _all() {
          return Array.from(self.__idLookup.values())
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
      }
    })
    .actions(self => {
      return {
        _addNew(extendedProps = {}) {
          assert(RA.isNotNil(extendedProps))
          const model = {
            _id: `${modelName}-${nanoid()}`,
            _rev: null,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            archived: false,
            actorId: getEnv(self).actorId,
            version: 0,
          }
          self.__db.put(R.mergeDeepRight(extendedProps, model))
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
        return R.sortWith(sortWithProps)(self._all)
      },

      clear() {
        self._clear()
      },
    }
  })
  .actions(self => {
    return {
      addNew() {
        self._addNew({text: ''})
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
      onClear() {
        return self.grains.clear()
      },
    }
  })
