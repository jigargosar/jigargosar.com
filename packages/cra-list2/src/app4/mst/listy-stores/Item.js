import {types} from 'mobx-state-tree'
import {Bucket} from './Bucket'
import {commonViews} from './Views'

export const Item = types
  .model('Item', {
    id: types.identifier,
    bucketId: types.reference(Bucket),
    text: '',
    done: false,
    deleted: false,
  })
  .views(commonViews)
  .views(views)
  .actions(actions)

function views(self) {
  return {
    get isSelected() {
      return self.domain.isItemSelected(self)
    },
    get bucket() {
      return self.bucketId
    },
    set bucket(bucket) {
      self.bucketId = bucket
    },
  }
}

function actions(self) {
  return {
    setSelected() {
      self.domain.setSelectedItem(self)
    },

    onDelete() {
      self.deleted = true
      // self.domain.deleteItem(self)
    },
    onFocus() {
      self.setSelected()
    },
  }
}
