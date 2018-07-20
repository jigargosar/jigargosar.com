import {types} from 'mobx-state-tree'
import {Bucket} from './Bucket'
import {commonViews} from './Views'

export const Item = types
  .model('Item', {
    id: types.identifier,
    bucket: types.reference(Bucket),
    text: '',
    done: false,
    deleted: false,
  })
  .views(commonViews)
  .views(views)
  .actions(actions)

function actions(self) {
  return {
    delete() {
      self.deleted = true
      self.domain.deleteItem(self)
    },
    select() {
      self.domain.selectItem(self)
    },
  }
}

function views(self) {
  return {
    get isSelected() {
      return self.domain.isItemSelected(self)
    },
  }
}
