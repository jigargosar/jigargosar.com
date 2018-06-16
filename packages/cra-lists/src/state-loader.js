import {State} from './mst/State'
import './lib/PouchDBService'

if (module.hot) {
  window.state = State
  if (module.hot.data && module.hot.data.snapshot) {
    // mst.applySnapshot(state, module.hot.data.snapshot)
  }
  module.hot.dispose(data => {
    console.clear()
    // data.snapshot = mst.getSnapshot(state)
    // mst.destroy(state)
  })
}
