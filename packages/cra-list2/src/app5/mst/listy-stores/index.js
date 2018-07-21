import rootStore from './root-store'
import {Model} from '../Model'
import {Collection} from '../Collection'

export const store = rootStore

const ItemModel = Model({
  name: 'Item',
  attrs: {},
})

console.log(`ItemModel`, ItemModel)

const ItemCollection = Collection({model: ItemModel})

console.log(`ItemCollection`, ItemCollection)
