import {types} from 'mobx-state-tree'
import {commonViews} from './Views'

export const Bucket = types
  .model('Bucket', {
    id: types.identifier,
    name: '',
  })
  .volatile(volatiles)
  .views(commonViews)
  .views(views)
  .actions(actions)

function volatiles(self) {
  return {
    // itemIds: [],
  }
}

function views(self) {
  return {
    get itemIds() {
      return self.domain.getBucketItemIds(self.id)
    },
    get items() {
      return self.domain.getBucketItems(self)
    },
  }
}

function actions(self) {
  return {
    updateItemIds() {
      // self.itemIds = self.domain.getBucketItems(self.id)
    },
    delete() {
      self.domain.deleteBucket(self)
    },
  }
}
