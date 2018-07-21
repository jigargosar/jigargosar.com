import {types} from 'mobx-state-tree'
import {R, validate} from '../little-ramda'
import {mValues} from '../mobx/little-mobx'

export function Collection({model: Model}) {
  return types
    .model(`${Model.name}Collection`, {
      lookup: types.map(Model),
    })
    .views(views)
    .actions(actions)

  function views(self) {
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

  function actions(self) {
    return {
      add(model) {
        validate('O', [model])
        return self.lookup.put(Model.create(model))
      },
      addAll(models) {
        validate('A', [models])
        return R.map(self.add)(models)
      },
    }
  }
}
