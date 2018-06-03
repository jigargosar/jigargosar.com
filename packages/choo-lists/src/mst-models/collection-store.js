const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')
import {clone, types} from 'mobx-state-tree'
import plur from 'plur'

export const createCollectionStore = Model => {
  assert(Model.isType)
  assert(Model.name !== 'AnonymousModel')
  assert(Model.name !== 'BaseModel')
  return types
    .model(`${plur(Model.name, 2)}Store`, {
      modelMap: types.optional(types.map(Model), {}),
    })
    .views(self => ({
      getList() {
        const models = Array.from(self.modelMap.values())
        return R.reject(R.prop('deleted'))(models)
      },
    }))
    .actions(self => {
      return {
        putAll(models) {
          assert(RA.isArray(models))
          models.forEach(self.put)
        },
        put(model) {
          assert(RA.isNotArray(model))
          self.modelMap.put(model)
        },
        getById(id) {
          return self.modelMap.get(id)
        },
        cloneById(id) {
          return clone(self.getById.get(id))
        },
      }
    })
}
