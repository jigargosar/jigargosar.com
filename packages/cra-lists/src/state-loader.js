import {State} from './mst/State'
import {getAppActorId} from './LocalStorage'

const mst = require('mobx-state-tree')

export const state = State.create(
  {},
  {localAppActorId: getAppActorId()},
)

if (module.hot) {
  window.state = state
  if (module.hot.data && module.hot.data.snapshot) {
    mst.applySnapshot(state, module.hot.data.snapshot)
  }
  module.hot.dispose(data => {
    console.clear()
    console.clear()
    data.snapshot = mst.getSnapshot(state)
    mst.destroy(state)
  })
}
