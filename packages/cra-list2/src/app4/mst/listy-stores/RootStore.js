import {mValues} from '../../mobx/little-mobx'
import {Item} from './Item'
import {rejectDeleted, selectWhere} from '../../model/utils'
import {Bucket, createBucket} from './Bucket'
import {types} from 'mobx-state-tree'

const ItemSelection = types
  .model('ItemSelection', {
    nullableSelectedItem: types.maybeNull(types.reference(Item)),
  })
  .extend(ItemSelectionExtension)

function ItemSelectionExtension(self) {
  return {
    views: {
      isItemSelected(model) {
        return self.nullableSelectedItem === model
      },
    },
    actions: {
      setSelectedItem(item) {
        self.nullableSelectedItem = item
      },
      unSelectItem(model) {
        if (self.nullableSelectedItem === model.id) {
          self.nullableSelectedItem = null
        }
      },
    },
  }
}

const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
    bucketLookup: types.map(Bucket),
  })
  .views(views)
  .actions(actions)

function views(self) {
  return {
    get items() {
      return mValues(self.itemLookup)
    },
    get activeItems() {
      return rejectDeleted(self.items)
    },
    getBucketItems(bucket) {
      return selectWhere({bucket})(self.activeItems)
    },
    get buckets() {
      return mValues(self.bucketLookup)
    },
    bucketById(id) {
      return self.bucketLookup.get(id)
    },
  }
}

function actions(self) {
  return {
    createNewItemsInBucketWithId(itemValues, bucketId) {
      itemValues.forEach(self.bucketById(bucketId).addItem)
    },
    addMockData() {
      const itemValues = [
        {text: 'FaDuu ToDOO'},
        {},
        {text: 'MoTu ToDOO'},
        {text: 'MoTu ToDOO'},
      ]

      const bucket = self.addBucket()
      itemValues.forEach(bucket.addItem)
    },
    addItem(item) {
      return self.itemLookup.put(item)
    },
    addBucket(values = {}) {
      return self.bucketLookup.put(createBucket(values))
    },
  }
}

export const RootStore = types
  .compose(DomainStore, ItemSelection)
  .named('RootStore')
