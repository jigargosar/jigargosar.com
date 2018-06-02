import {BaseModel} from './base-model'
import {types} from 'mobx-state-tree'

const R = require('ramda')
const RA = require('ramda-adjunct')

const assert = require('assert')

export const Grain = BaseModel.named('Grain')
  .props({
    text: types.optional(types.string, () => ''),
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
  assert(Model.name !== "AnonymousModel")
  console.log(Model)
  return types
    .model(`${Model.name}Store`, {
      modelMap: types.optional(types.map(Model), () => ({})),
    })
    .views(self => ({
      getList() {
        return Array.from(self.modelMap.values())
      },
    }))
    .actions(self => ({
      add(model) {
        self.modelMap.put(model)
      },
    }))
}

export const GrainsStore = createCollectionStore(Grain)
