import {BaseModel} from './base-model'
import {types} from 'mobx-state-tree'
import plur from 'plur'

const R = require('ramda')
const RA = require('ramda-adjunct')

const assert = require('assert')

export const Grain = BaseModel.named('Grain')
  .props({
    text: types.optional(types.string, ''),
  })
  .views(self => ({
    getText() {
      return self.text
    },
    getUserEditableProps() {
      return ['text']
    },
  }))

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
        const models = Array.from(self.modelMap.values());
        return R.reject(R.prop("deleted"))(models)
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
      }
    })
}

export const GrainsStore = createCollectionStore(Grain)
