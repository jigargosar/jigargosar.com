import {types} from 'mobx-state-tree'

const mst = require('mobx-state-tree')
const nanoid = require('nanoid')
const log = require('nanologger')('rootStore')

const Grain = types.model('Grain', {
  id: types.identifier(types.string),
  text: types.string,
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
        self.grainsMap.put(
          Grain.create({id: `grain-${nanoid()}`, text: ''}),
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

export const state = State.create()

if (module.hot) {
  window.state = state
  if (module.hot.data && module.hot.data.snapshot) {
    mst.applySnapshot(state, module.hot.data.snapshot)
  }
  module.hot.dispose(data => {
    data.snapshot = mst.getSnapshot(state)
  })
}
