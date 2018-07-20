import {types} from 'mobx-state-tree'
import {commonViews} from './Views'
import {Item} from './Item'
import {modelId} from '../../model/utils'

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
    get items() {
      return self.domain.getBucketItems(self)
    },
  }
}

function actions(self) {
  return {
    delete() {
      self.domain.deleteBucket(self)
    },
    addItem(values) {
      return self.domain.addItem([
        Item.create({
          bucket: self,
          ...values,
          id: modelId(Item.name),
        }),
      ])
    },
    onAddItem() {
      return self.addItem()
    },
  }
}
