// import {getSnapshot} from 'mobx-state-tree'
import {modelId} from '../../model/utils'
import {applySnapshot2} from '../little-mst'
import {dotPath, whenNotNil} from '../../little-ramda'
import {RootStore} from './RootStore'
import {getSnapshot, setLivelynessChecking} from 'mobx-state-tree'

setLivelynessChecking('error')

const bucketId = modelId('Bucket')
const rootStore = RootStore.create({
  bucketLookup: {[bucketId]: {id: bucketId}},
})

function logStoreSnapshot(store) {
  console.debug(`getSnapshot(store)`, getSnapshot(store))
}

logStoreSnapshot(rootStore)

if (module.hot) {
  rootStore.createNewItemsInBucketWithId(
    [
      {text: 'FaDuu ToDOO'},
      {},
      {text: 'MoTu ToDOO'},
      {text: 'MoTu ToDOO'},
    ],
    bucketId,
  )
  logStoreSnapshot(rootStore)

  const snap = dotPath('hot.data.snap')(module)
  whenNotNil(applySnapshot2(rootStore))(snap)

  // console.table(mapSnapshot(store.items))

  module.hot.dispose(data => (data.snap = getSnapshot(rootStore)))
}

export default rootStore
