import rootStore from './root-store'
import {Model} from '../Model'
import {types} from 'mobx-state-tree'

export const store = rootStore

const ItemModel = Model({
  name: 'Item',
  attrs: {
    id: types.identifier,
  },
})

console.log(`ItemModel`, ItemModel)
