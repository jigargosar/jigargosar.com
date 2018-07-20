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
    },
    getBucketItems(bucket) {
      return _.filter(_.propEq('bucket', bucket))(self.activeItems)
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
    addItemValuesToBucketId(itemValues, bucketId) {
      const bucket = self.bucketLookup.get(bucketId)
      itemValues.forEach(bucket.addItem)
    },
    addItem(item) {
      self.itemLookup.put(item)
    },
    setSelectedItem(item) {
      self.nullableSelectedItemId = item.id
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
  }
}
