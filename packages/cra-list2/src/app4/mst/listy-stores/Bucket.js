import {types} from 'mobx-state-tree'
import {_} from '../../little-ramda'
import {commonViews} from './Views'

export const Bucket = types
  .model('Bucket', {
    id: types.identifier,
    name: '',
  })
  .views(commonViews)
  .views(views)
  .actions(actions)

function actions(self) {
  return {
    delete() {
      self.domain.deleteBucket(self)
    },
  }
}

function views(self) {
  return {
    get items() {
      return self.domain.items.filter(_.propEq('bucket')(self))
    },
  }
}
