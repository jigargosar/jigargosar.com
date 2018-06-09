// const log = require('nanologger')('rootStore')
import {getEnv, types} from 'mobx-state-tree'
import {SF} from './safe-fun'

const R = require('ramda')

const nanoid = require('nanoid')

const InvalidAccessReporter = {
  get: function(target, prop, receiver) {
    const shouldValidateProp = ![
      Symbol.iterator,
      Symbol.toStringTag,
      '_reactFragment',
      '@@functional/placeholder',
    ].includes(prop)

    const isPropInvalid = !R.hasIn(prop, target)
    if (shouldValidateProp && isPropInvalid) {
      console.log('Prop not found', prop, 'in', target)
    }
    return Reflect.get(...arguments)
  },
}

const validatePropAccessProperty = obj =>
  new Proxy(obj, InvalidAccessReporter)

function createPouchFireModel(name) {
  return types.model(`PouchFire${name}Model`, {
    _id: types.identifier(types.string),
    _rev: types.maybe(types.string),
    actorId: types.string,
    createdAt: types.number,
    modifiedAt: types.number,
    archived: types.boolean,
  })
}

function createPouchFireCollection(Model, name) {
  return types.model(`PouchFire${name}Collection`, {
    lookup: types.optional(types.map(Model), {}),
  })
}

const PFGrain = createPouchFireModel('Grain').props({
  text: types.string,
})

const PFGrainCollection = createPouchFireCollection(PFGrain, 'Grain')

const Grain = types.model('Grain', {
  id: types.identifier(types.string),
  text: types.string,
  actorId: types.string,
  pouchDBRevision: types.maybe(types.string),
  createdAt: types.number,
  modifiedAt: types.number,
  archived: types.boolean,
})

const GrainCollection = types
  .model('GrainCollection', {
    grainsMap: types.optional(types.map(Grain), {}),
  })
  .views(self => {
    return {
      get list() {
        const sortWithPropsAs = [R.descend(SF.prop('createdAt'))]

        return R.compose(
          R.sortWith(sortWithPropsAs),
          R.map(validatePropAccessProperty),
          Array.from,
        )(self.grainsMap.values())
      },
    }
  })
  .actions(self => {
    return {
      addNew() {
        const grain = Grain.create({
          id: `grain-${nanoid()}`,
          text: '',
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          archived: false,
          actorId: getEnv(self).actorId,
        })
        self.grainsMap.put(validatePropAccessProperty(grain))
      },
      clear() {
        self.grainsMap.clear()
      },
    }
  })

export const State = types
  .model('RootState', {
    pageTitle: 'CRA List Proto',
    grains: types.optional(GrainCollection, () =>
      GrainCollection.create(),
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
