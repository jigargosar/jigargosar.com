import {getRoot, types} from 'mobx-state-tree'

export const Item = types
  .model('Item', {
    id: types.identifier,
    text: '',
    done: false,
  })
  .views(views)
  .actions(actions)

function actions(self) {
  return {
    delete() {
      self.parent.deleteItem(self)
    },
  }
}

function views(self) {
  return {
    get parent() {
      return getRoot(self)
    },
  }
}
