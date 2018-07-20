import {mValues} from '../../mobx/little-mobx'
import {Item} from './Item'
import {isDeleted, modelId} from '../../model/utils'
import {Bucket} from './Bucket'
import {setLivelynessChecking, types} from 'mobx-state-tree'
import {_} from '../../little-ramda'

setLivelynessChecking('error')

export const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
    bucketLookup: types.map(Bucket),
    nullableSelectedItem: types.maybeNull(types.reference(Item)),
  })
  .views(views)
  .actions(actions)

function hasRelation(relation) {
  const [key, value] = _.compose(_.head, _.toPairs)(relation)
  return item => item[key] === value
}

function views(self) {
  return {
    get items() {
      return mValues(self.itemLookup)
    },
    get activeItems() {
      return _.reject(isDeleted)(self.items)
    },
    getBucketItems(bucket) {
      return _.filter(hasRelation({bucket}))(self.activeItems)
    },
    isItemSelected(model) {
      return self.nullableSelectedItem === model
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
      return self.itemLookup.put(item)
    },
    setSelectedItem(item) {
      self.nullableSelectedItem = item
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
