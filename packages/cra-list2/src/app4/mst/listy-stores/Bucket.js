import {types} from 'mobx-state-tree'
import {commonViews} from './Views'
import {createItem} from './Item'

export const Bucket = types
  .model('Bucket', {
    id: types.identifier,
    name: '',
  })
  .views(commonViews)
  .views(views)
  .actions(actions)

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
      return self.domain.addItem(createItem(values, self))
    },
    onAddItem() {
      return self.addItem()
    },
  }
}
