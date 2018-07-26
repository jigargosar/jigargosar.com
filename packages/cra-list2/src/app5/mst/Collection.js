import {types} from 'mobx-state-tree'
import {mValues} from '../mobx/little-mobx'
import {modelNamed} from '../little-mst'
import {T, whereEq, filter, reject, find, map, forEach} from 'ramda'

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
      whereEq: attrs => self.filter(whereEq(attrs)),
      filter: pred => filter(pred)(self.list),
      reject: pred => reject(pred)(self.list),
      find: pred => find(pred || T)(self.list),
    }))
    .actions(self => ({
      add: m => self.lookup.put(Model.create(m)),
      addAll: map(self.add),
      delete: m => self.lookup.delete(m.id),
      remove: m => self.lookup.delete(m.id),
      deleteAll: l => forEach(self.remove)(l),
    }))
}
