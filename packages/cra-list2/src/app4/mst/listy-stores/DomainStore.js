import {mValues} from '../../mobx/little-mobx'
import {Item} from './Item'
import {modelId} from '../../model/utils'
import {Bucket} from './Bucket'
import {setLivelynessChecking, types} from 'mobx-state-tree'
import {_, idEq} from '../../little-ramda'

setLivelynessChecking('error')

export const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
    bucketLookup: types.map(Bucket),
    bucket: types.reference(Bucket),
    nullableSelectedItemId: types.maybeNull(types.string),
  })
  .views(views)
  .actions(actions)

function views(self) {
  return {
    get items() {
      return mValues(self.itemLookup)
    },
    get activeItems() {
      return _.reject(_.propOr(false, 'deleted'))(self.items)
      // return self.items
    },
    getBucketItems(bucket) {
      return _.compose(_.filter(_.pathEq(['bucket'], bucket)))(
        self.activeItems,
      )
    },
    isItemSelected(model) {
      return idEq(self.nullableSelectedItemId)(model)
    },

    get buckets() {
      return mValues(self.bucketLookup)
    },
  }
}

function actions(self) {
  return {
    setItemSelection(item) {
      self.nullableSelectedItemId = item.id
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
    unSelectItem(model) {
      if (self.nullableSelectedItem === model.id) {
        self.nullableSelectedItem = null
      }
    },
    deleteBucket(model) {
      return self.bucketLookup.delete(model.id)
    },
  }
}
