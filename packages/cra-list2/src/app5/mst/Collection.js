import {types} from 'mobx-state-tree'
import {mValues} from '../mobx/little-mobx'
import {modelNamed} from '../little-mst'
import * as R from 'ramda'

export function Collection(Model) {
  return modelNamed(`${Model.name}Collection`)
    .props({
      lookup: types.map(Model),
    })
    .views(self => ({
      get list() {
        return mValues(self.lookup)
      },
      get: id => self.lookup.get(id),
      whereEq: attrs => self.filter(R.whereEq(attrs)),
      filter: pred => R.filter(pred)(self.list),
      reject: pred => R.reject(pred)(self.list),
      find: pred => R.find(pred || R.T)(self.list),
    }))
    .actions(self => ({
      add: m => self.lookup.put(Model.create(m)),
      addAll: R.map(self.add),
      delete: m => self.lookup.delete(m.id),
      deleteAll: R.forEach(self.delete),
    }))
}
