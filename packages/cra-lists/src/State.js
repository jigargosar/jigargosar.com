import {types} from 'mobx-state-tree'

const nanoid = require('nanoid')
// const log = require('nanologger')('rootStore')

const Grain = types.model('Grain', {
  id: types.identifier(types.string),
  text: types.string,
})

const Metadata = types.model('Metadata', {
  id: types.identifier(types.string),
  grain: types.reference(Grain),
  pouchDBRevision: types.maybe(types.string),
  createAt: types.number,
  modifiedAt: types.number,
  archived: types.boolean,
})

const GrainCollection = types
  .model('GrainCollection', {
    grainsMap: types.optional(types.map(Grain), {}),
    metaMap: types.optional(types.map(Metadata), {}),
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
        const id = `grain-${nanoid()}`
        const grain = Grain.create({
          id,
          text: '<Empty Text>',
        })
        self.grainsMap.put(grain)
        self.metaMap.put(
          Metadata.create({
            id: grain.id,
            grain,
            createAt: Date.now(),
            modifiedAt: Date.now(),
            archived: false,
          }),
        )
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
