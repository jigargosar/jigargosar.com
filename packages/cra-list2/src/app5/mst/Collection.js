import {types} from 'mobx-state-tree'
import {R} from '../little-ramda'
import {mValues} from '../mobx/little-mobx'

export function Collection({model}) {
  return types
    .model(`${model.name}Collection`, {
      lookup: types.map(model),
    })
    .views(ext)

  function ext(self) {
    return {
      get list() {
        return mValues(self.lookup)
      },
      get(id) {
        return self.lookup.get(id)
      },
      whereEq(attrs) {
        return R.whereEq(attrs)(self.list)
      },
      filter(pred) {
        return R.filter(pred)(self.list)
      },
      reject(pred) {
        return R.reject(pred)(self.list)
      },
    }
  }
}
