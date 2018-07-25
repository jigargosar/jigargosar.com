import {types} from 'mobx-state-tree'
import {mValues} from '../mobx/little-mobx'
import {modelNamed} from '../little-mst'
import * as R from 'ramda'

const deleteKey = R.curry((key, map) => map.delete(key))

export function Collection(Model) {
  function createModel(snap) {
    return Model.create(snap)
  }

  const put = R.curry((model, map) => map.put(model))

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
      add: R.compose(put(R.__, self.lookup), createModel),
      addAll: R.map(self.add),
      deleteId: deleteKey(R.__, self.lookup),
      delete: R.compose(self.deleteId, R.prop('id')),
      deleteAll: R.forEach(self.delete),
    }))
}
