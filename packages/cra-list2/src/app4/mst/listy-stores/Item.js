import {types} from 'mobx-state-tree'
import {Bucket} from './Bucket'
import {commonViews} from './Views'
import {modelId} from '../../model/utils'

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

function views(self) {
  return {
    get isSelected() {
      return self.domain.isItemSelected(self)
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
    },
    onFocus() {
      self.setSelected()
    },
  }
}

export function createItem(values, bucket) {
  return Item.create({
    bucket,
    ...values,
    id: modelId(Item.name),
  })
}
