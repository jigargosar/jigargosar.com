import {getRoot, types} from 'mobx-state-tree'

const R = require('ramda')

// const RA = require('ramda-adjunct')

const nanoid = require('nanoid')
// const log = require('nanologger')('rootStore')

const Grain = types.model('Grain', {
  id: types.identifier(types.string),
  text: types.string,
  actorId: types.string,
  pouchDBRevision: types.maybe(types.string),
  createAt: types.number,
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
        return Array.from(self.grainsMap.values())
      },
    }
  })
  .actions(self => {
    return {
      addNew() {
        self.grainsMap.put({
          id: `grain-${nanoid()}`,
          text: '',
          createAt: Date.now(),
          modifiedAt: Date.now(),
          archived: false,
          actorId: getRoot(self).actorId,
        })
      },
      clear() {
        self.grainsMap.clear()
      },
    }
  })

function getOrSetLocalStorage(id, setValue) {
  let value = localStorage.getItem(id)
  if (R.isNil(value)) {
    value = localStorage.setItem(id, setValue)
  }
  return value
}

function getAppActorId() {
  return getOrSetLocalStorage('app-actor-id', `actor-${nanoid()}`)
}

export const State = types
  .model('RootState', {
    pageTitle: 'CRA List Proto',
    grains: types.optional(GrainCollection, () =>
      GrainCollection.create(),
    ),
  })
  .views(self => {
    let actorId = null
    return {
      afterCreate() {
        actorId = getAppActorId()
      },
      get grainsList() {
        return self.grains.list
      },
      get actorId() {
        return actorId
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
