import {Model} from '../Model'
import {types} from 'mobx-state-tree'
import {Collection} from '../Collection'

export const DashboardModel = Model({
  name: 'Dashboard',
}).views(self => ({
  get buckets() {
    return Buckets.whereDashboardEq(self)
  },
}))

export const BucketModel = Model({
  name: 'Bucket',
  attrs: {dashboard: types.reference(DashboardModel)},
}).views(self => ({
  get items() {
    return Items.whereBucketEq(self)
  },
}))

const ItemModel = Model({
  name: 'Item',
  attrs: {bucket: types.reference(BucketModel)},
})

export const Items = Collection({
  model: ItemModel,
})
  .views(self => ({
    whereBucketEq(bucket) {
      return self.whereEq({bucket})
    },
  }))
  .create()

export const Buckets = Collection({
  model: BucketModel,
})
  .views(self => ({
    whereDashboardEq(dashboard) {
      return self.whereEq({dashboard})
    },
  }))
  .create()

export const Dashboards = Collection({
  model: DashboardModel,
}).create()
