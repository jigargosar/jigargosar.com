import rootStore from './root-store'
import {Model} from '../Model'

export const store = rootStore

const ItemModel = Model({
  name: 'Item',
  attrs: {
    deleted: false,
  },
})

console.log(`ItemModel`, ItemModel)
