import {getRoot, types} from 'mobx-state-tree'
import {_} from '../../little-ramda'

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
    get items() {
      return self.root.items.filter(_.propEq('bucket')(self))
    },
    get root() {
      return getRoot(self)
    },
  }
}
