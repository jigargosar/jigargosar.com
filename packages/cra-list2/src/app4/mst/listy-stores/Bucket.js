import {types} from 'mobx-state-tree'
import {commonViews} from './Views'
import {createItem} from './Item'
import {modelId} from '../../model/utils'
import {_, isIndexOutOfBounds} from '../../little-ramda'

export const Bucket = types
  .model('Bucket', {
    id: types.identifier,
    name: '',
    deleted: false,
  })
  .views(commonViews)
  .views(views)
  .actions(actions)

function views(self) {
  return {
    get items() {
      return self.root.getBucketItems(self)
    },
    nextSiblingOfItem(item) {
      const idx = _.indexOf(item)(self.items) + 1
      return isIndexOutOfBounds(idx, self.items)
        ? item
        : self.items[idx]
    },
  }
}

function actions(self) {
  return {
    onDelete() {
      self.deleted = true
    },
    addItem(values) {
      return self.root.addItem(createItem(values, self))
    },
    onAddItem() {
      return self.addItem().setSelected()
    },
  }
}

export function createBucket(values) {
  return Bucket.create({
    ...values,
    id: modelId(Bucket.name),
  })
}
