import {Model} from '../Model'
import {types} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {constant, R} from '../../little-ramda'

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

export const ItemCollection = Collection({
  model: ItemModel,
}).views(self => ({
  whereBucketEq(bucket) {
    return self.whereEq({bucket})
  },
}))

export const Items = ItemCollection.create()

export const BucketCollection = Collection({
  model: BucketModel,
}).views(self => ({
  whereDashboardEq(dashboard) {
    return self.whereEq({dashboard})
  },
}))
export const Buckets = BucketCollection.create()

export const DashboardCollection = Collection({
  model: DashboardModel,
})

export const Dashboards = DashboardCollection.create()

export const Domain = types
  .model('Domain', {
    items: types.optional(ItemCollection, {}),
    buckets: types.optional(BucketCollection, {}),
    dashboards: types.optional(DashboardCollection, {}),
  })
  .views(domainViews)
  .actions(domainActions)

function domainViews(self) {
  return {
    collectionFromType(ct) {
      return R.cond([
        [R.equals(ItemCollection), constant(self.items)],
        [R.equals(BucketCollection), constant(self.buckets)],
        [R.equals(DashboardCollection), constant(self.dashboards)],
      ])(ct)
    },
  }
}

function domainActions(self) {
  return {
    add(model, collectionType) {
      return self.collectionFromType(collectionType).add(model)
    },
  }
}
