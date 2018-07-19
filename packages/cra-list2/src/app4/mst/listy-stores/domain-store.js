import {getSnapshot, types} from 'mobx-state-tree'
import {modelId} from '../../model/utils'
import {mValues} from '../../mobx/little-mobx'
import {applySnapshot2} from '../little-mst'
import {_, dotPath, isNotNil, modelsToIds} from '../../little-ramda'
import {Item} from './Item'
import {Bucket} from './Bucket'

const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
    bucketLookup: types.map(Bucket),
    bucket: types.reference(Bucket),
  })
  .views(views)
  .actions(actions)

function views(self) {
  return {
    get items() {
      return mValues(self.itemLookup)
    },
    get itemIds() {
      return modelsToIds(self.items)
    },
  }
}

function actions(self) {
  return {
    addItem(values) {
      return self.itemLookup.put(
        Item.create({
          bucket: self.bucket,
          ...values,
          id: modelId(Item.name),
        }),
      )
    },
    deleteItem(model) {
      return self.itemLookup.delete(model.id)
    },
    deleteBucket(model) {
      return self.bucketLookup.delete(model.id)
    },
  }
}

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

export default store
