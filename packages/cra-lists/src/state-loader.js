import {State} from './State'
import {getAppActorId} from './LocalStorage'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')

const mst = require('mobx-state-tree')

export const state = State.create(
  {},
  {actorId: getAppActorId(), firebase},
)

mst.addMiddleware(state, (call, next) => {
  // console.log('in here', call)
  // loggedActions.unshift({ name: call.name, args: call.args });
  next(call)
})

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
