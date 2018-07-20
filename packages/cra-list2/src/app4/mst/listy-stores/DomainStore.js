import {mValues} from '../../mobx/little-mobx'
import {Item} from './Item'
import {modelId} from '../../model/utils'
import {Bucket} from './Bucket'
import {types} from 'mobx-state-tree'

export const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
    bucketLookup: types.map(Bucket),
    bucket: types.reference(Bucket),
    selectedItem: types.maybe(types.reference(Item)),
  })
  .views(views)
  .actions(actions)

function views(self) {
  return {
    get items() {
      return mValues(self.itemLookup)
    },

    get buckets() {
      return mValues(self.bucketLookup)
    },
  }
}

function actions(self) {
  return {
    selectItem(item) {
      self.selectedItem = item
      return self.selectedItem
    },
    addItem(values) {
      return self.itemLookup.put(
        Item.create({
          bucket: self.bucket,
          ...values,
          id: modelId(Item.name),
        }),
      )
    },
    addBucket(values) {
      return self.bucketLookup.put(
        Bucket.create({
          ...values,
          id: modelId(Bucket.name),
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
