// import {getSnapshot} from 'mobx-state-tree'
import {applySnapshot2} from '../../little-mst'
import {dotPath, whenNotNil} from '../../little-ramda'
import {RootStore} from './RootStore'
import {getSnapshot} from 'mobx-state-tree'

const rootStore = RootStore.create({})

function logStoreSnapshot(store) {
  console.debug(`getSnapshot(store)`, getSnapshot(store))
}

logStoreSnapshot(rootStore)

if (module.hot) {
  rootStore.addMockData()

  logStoreSnapshot(rootStore)

  const snap = dotPath('hot.data.snap')(module)
  whenNotNil(applySnapshot2(rootStore))(snap)

  // console.table(mapSnapshot(store.items))

  module.hot.dispose(data => (data.snap = getSnapshot(rootStore)))
}

export default rootStore
