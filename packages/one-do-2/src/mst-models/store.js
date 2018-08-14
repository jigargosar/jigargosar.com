import RootStore from './RootStore'
import {hotDispose} from '../lib/hot'

const store = RootStore.create({}, {})

store.loadFromLS()
const disposer = store.saveToLSOnSnapshotChange()

store.ensureLogin()

setInterval(() => store.trySync(), 15 * 1000)

export default store

if (module.hot) {
  window.s = store
  hotDispose(disposer, module)
}
