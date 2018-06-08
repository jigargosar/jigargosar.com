import {types} from 'mobx-state-tree'

const mst = require('mobx-state-tree')
const nanoid = require('nanoid')

const Grain = types.model('Grain', {
  id: types.identifier(types.string),
  text: types.string,
})

export const State = types
  .model('RootState', {
    counter: 0,
    pageTitle: 'CRA List Proto',
    grainsMap: types.optional(types.map(Grain), {}),
  })
  .views(self => {
    return {
      get grainsList() {
        return Array.from(self.grainsMap.values())
      },
    }
  })
  .actions(self => {
    return {
      inc() {
        self.counter += 1
      },
      dec() {
        self.counter -= 1
      },
      reset() {
        self.counter = 0
      },
      addNew() {
        self.grainsMap.put(
          Grain.create({id: `grain-${nanoid()}`, text: ''}),
        )
      },
    }
  })

export const state = State.create()

if (module.hot) {
  if (module.hot.data && module.hot.data.snapshot) {
    mst.applySnapshot(state, module.hot.data.snapshot)
  }
  module.hot.dispose(data => {
    data.snapshot = mst.getSnapshot(state)
  })
}
