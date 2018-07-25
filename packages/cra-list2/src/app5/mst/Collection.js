import {types} from 'mobx-state-tree'
import {mValues} from '../mobx/little-mobx'
import {modelNamed} from '../little-mst'
import * as R from 'ramda'
import validate from '../vendor/aproba'

export function Collection(Model) {
  return modelNamed(`${Model.name}Collection`)
    .props({
      lookup: types.map(Model),
    })
    .views(self => ({
      get list() {
        return mValues(self.lookup)
      },
      get(id) {
        return self.lookup.get(id)
      },
      whereEq(attrs) {
        return self.filter(R.whereEq(attrs))
      },
      filter(pred) {
        return R.filter(pred)(self.list)
      },
      reject(pred) {
        return R.reject(pred)(self.list)
      },
      find(pred = R.T) {
        return R.find(pred)(self.list)
      },
    }))
    .actions(self => ({
      add: model => self.lookup.put(Model.create(model)),
      addAll(models) {
        validate('A', [models])
        return R.map(self.add)(models)
      },
      delete(model) {
        self.lookup.delete(model.id)
      },
      deleteAll(models) {
        R.forEach(self.delete)(models)
      },
    }))
}
