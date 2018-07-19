import {getRoot, types} from 'mobx-state-tree'
import {Bucket} from './Bucket'

export const Item = types
  .model('Item', {
    id: types.identifier,
    bucket: types.reference(Bucket),
    text: '',
    done: false,
  })
  .views(views)
  .actions(actions)

function actions(self) {
  return {
    delete() {
      self.root.deleteItem(self)
    },
  }
}

function views(self) {
  return {
    get root() {
      return getRoot(self)
    },
  }
}
