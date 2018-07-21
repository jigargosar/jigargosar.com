import rootStore from './root-store'
import {Model} from '../Model'
import {Collection} from '../Collection'
import {types} from 'mobx-state-tree'

export const store = rootStore

const BucketModel = Model({
  name: 'Bucket',
  attrs: {},
})

const ItemModel = Model({
  name: 'Item',
  attrs: {bucket: types.reference(BucketModel)},
})

const ItemCollection = Collection({
  model: ItemModel,
})
  .views(self => ({
    whereBucketEq(bucket) {
      return self.whereEq({bucket})
    },
  }))
  .create()

const b = BucketModel.create()

ItemCollection.add({bucket: b})

console.log(`ItemCollection`, ItemCollection.list)
