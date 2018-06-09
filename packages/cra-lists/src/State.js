// const log = require('nanologger')('rootStore')
import {getEnv, types} from 'mobx-state-tree'
import {SF} from './safe-fun'

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

function createPouchFireCollection(Model, name) {
  return types
    .model(`PouchFire${name}Collection`, {
      _idLookup: types.optional(types.map(Model), {}),
    })
    .views(self => {
      return {
        get _all() {
          return Array.from(self._idLookup.values())
        },
      }
    })
    .actions(self => {
      return {
        _addNew(extendedProps = {}) {
          assert(RA.isNotNil(extendedProps))
          const model = {
            _id: `${name}-${nanoid()}`,
            _rev: null,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            archived: false,
            actorId: getEnv(self).actorId,
            version: 0,
          }
          self._idLookup.put(R.mergeDeepRight(extendedProps, model))
        },
        _clear() {
          self._idLookup.clear()
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
    grains: types.optional(PFGrainCollection, () =>
      PFGrainCollection.create(),
    ),
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
