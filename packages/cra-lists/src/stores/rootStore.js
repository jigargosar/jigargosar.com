import {types} from 'mobx-state-tree'

const mst = require('mobx-state-tree')
const R = require('ramda')

export const State = types
  .model('RootState', {
    counter: 0,
    pageTitle: 'CRA List Proto',
    list: types.optional(types.array(types.number), [1, 2, 4]),
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
        self.list = R.prepend(self.list.length, self.list)
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
