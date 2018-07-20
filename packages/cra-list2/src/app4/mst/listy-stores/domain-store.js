import {getSnapshot} from 'mobx-state-tree'
import {modelId} from '../../model/utils'
import {applySnapshot2} from '../little-mst'
import {_, dotPath, isNotNil} from '../../little-ramda'
import {DomainStore} from './DomainStore'

const bucketId = modelId('Bucket')
const store = DomainStore.create({
  bucketLookup: {[bucketId]: {id: bucketId}},
  bucket: bucketId,
})

function logStoreSnapshot() {
  console.debug(`getSnapshot(store)`, getSnapshot(store))
}

logStoreSnapshot()

if (module.hot) {
  store.addItem()
  store.addItem({text: 'MoTu ToDOO'})
  store.deleteItem(store.addItem())
  store.deleteItem(store.addItem())
  store.deleteItem(store.addItem())
  store.deleteItem(store.addItem())
  store.addItem({text: 'FaDuu ToDOO'})
  logStoreSnapshot()
  const snap = dotPath('hot.data.snap')(module)
  _.when(isNotNil)(applySnapshot2(store))(snap)

  // console.table(mapSnapshot(store.items))

  module.hot.dispose(data => (data.snap = getSnapshot(store)))
}

export {store}
