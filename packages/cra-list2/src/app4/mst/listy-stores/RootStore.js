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

export const DomainStore = types
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
    get buckets() {
      return mValues(self.bucketLookup)
    },
    get activeItems() {
      return rejectDeleted(self.items)
    },
    get activeBuckets() {
      return rejectDeleted(self.buckets)
    },
    bucketById(id) {
      return self.bucketLookup.get(id)
    },
    itemById(id) {
      return self.itemLookup.get(id)
    },
    getBucketItems(bucket) {
      return selectWhere({bucket})(self.activeItems)
    },
  }
}

function actions(self) {
  return {
    addMockData: AddMockDataAction(self),
    addItem(item) {
      return self.itemLookup.put(item)
    },
    _addBucket(bucket) {
      return self.bucketLookup.put(bucket)
    },
    addBucket(values = {}) {
      return self.bucketLookup.put(createBucket(values))
    },
  }
}

function AddMockDataAction(self) {
  return () => {
    const itemValues = [
      {text: 'FaDuu ToDOO'},
      {},
      {text: 'MoTu ToDOO'},
      {text: 'MoTu ToDOO'},
    ]

    const bucket = self.addBucket()
    itemValues.forEach(bucket.addItem)
  }
}

export const RootStore = types
  .compose(DomainStore, ItemSelection)
  .named('RootStore')
