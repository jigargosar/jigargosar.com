// import {getSnapshot} from 'mobx-state-tree'
import {modelId} from '../../model/utils'
import {applySnapshot2} from '../little-mst'
import {dotPath, whenNotNil} from '../../little-ramda'
import {DomainStore} from './DomainStore'
import {getSnapshot} from 'mobx-state-tree'

const bucketId = modelId('Bucket')
const domainStore = DomainStore.create({
  bucketLookup: {[bucketId]: {id: bucketId}},
  bucket: bucketId,
})

function logStoreSnapshot() {
  console.debug(`getSnapshot(store)`, getSnapshot(domainStore))
}

logStoreSnapshot()

if (module.hot) {
  domainStore.createNewItemsInBucketWithId(
    [
      {text: 'FaDuu ToDOO'},
      {},
      {text: 'MoTu ToDOO'},
      {text: 'MoTu ToDOO'},
    ],
    bucketId,
  )
  logStoreSnapshot()
  const snap = dotPath('hot.data.snap')(module)
  whenNotNil(applySnapshot2(domainStore))(snap)

  // console.table(mapSnapshot(store.items))

  module.hot.dispose(data => (data.snap = getSnapshot(domainStore)))
}

export default domainStore
