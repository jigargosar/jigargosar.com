import {getRoot, types} from 'mobx-state-tree'

export const Bucket = types
  .model('Bucket', {
    id: types.identifier,
    name: '',
  })
  .views(views)
  .actions(actions)

function actions(self) {
  return {
    delete() {
      self.root.deleteBucket(self)
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
