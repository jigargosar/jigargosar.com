import {mValues} from '../../mobx/little-mobx'
import {Item} from './Item'
import {modelId, rejectDeleted, selectWhere} from '../../model/utils'
import {Bucket} from './Bucket'
import {setLivelynessChecking, types} from 'mobx-state-tree'

setLivelynessChecking('error')

const selectionProps = {
  nullableSelectedItem: types.maybeNull(types.reference(Item)),
}
function selectionExtension(self) {
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
  .props(selectionProps)
  .extend(selectionExtension)

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
    addItem(item) {
      return self.itemLookup.put(item)
    },
    addBucket(values) {
      return self.bucketLookup.put(
        Bucket.create({
          ...values,
          id: modelId(Bucket.name),
        }),
      )
    },
  }
}
