import {types} from 'mobx-state-tree'

const nanoid = require('nanoid')
// const log = require('nanologger')('rootStore')

const Grain = types.model('Grain', {
  id: types.identifier(types.string),
  text: types.string,
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
        })
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
