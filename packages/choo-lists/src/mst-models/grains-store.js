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
  // console.log(Model)
  return types
    .model(`${plur(Model.name, 2)}Store`, {
      modelMap: types.optional(types.map(Model), {}),
    })
    .views(self => ({
      getList() {
        return Array.from(self.modelMap.values())
      },
      _put(){
        return self.modelMap.put.bind(self.modelMap)
      }
    }))
    .actions(self => {
      return {
        put: R.compose(R.forEach(self._put), R.flatten, Array.of),
      }
    })
}

export const GrainsStore = createCollectionStore(Grain)
