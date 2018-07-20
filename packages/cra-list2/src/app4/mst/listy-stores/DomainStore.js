import {mValues} from '../../mobx/little-mobx'
import {Item} from './Item'
import {modelId} from '../../model/utils'
import {Bucket} from './Bucket'
import {setLivelynessChecking, types} from 'mobx-state-tree'

setLivelynessChecking('error')

export const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
    bucketLookup: types.map(Bucket),
    bucket: types.reference(Bucket),
    nullableSelectedItem: types.maybeNull(types.reference(Item)),
  })
  .views(views)
  .actions(actions)

function views(self) {
  return {
    isItemSelected(model) {
      return model === this.nullableSelectedItem
    },
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
      self.nullableSelectedItem = item
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
      if (self.nullableSelectedItem === model) {
        self.nullableSelectedItem = null
      }
      return self.itemLookup.delete(model.id)
    },
    deleteBucket(model) {
      return self.bucketLookup.delete(model.id)
    },
  }
}
