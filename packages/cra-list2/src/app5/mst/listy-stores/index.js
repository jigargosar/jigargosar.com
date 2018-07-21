import rootStore from './root-store'
import {Model} from '../Model'
import {Collection} from '../Collection'
import {types} from 'mobx-state-tree'
import {mapSnapshot} from '../../little-mst'

export const store = rootStore

const DashboardModel = Model({
  name: 'Dashboard',
})
const BucketModel = Model({
  name: 'Bucket',
  attrs: {dashboard: types.reference(DashboardModel)},
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

const d = DashboardModel.create()
const b = BucketModel.create({dashboard: d})

ItemCollection.add({bucket: b})

const list = ItemCollection.list
console.log(`ItemCollection.list`, list, mapSnapshot(list))
