import {Model} from '../Model'
import {getParentOfType, types} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {constant, R} from '../../little-ramda'

export const DashboardM = Model({
  name: 'Dashboard',
})
  .views(self => ({
    get buckets() {
      return Buckets.whereDashboardEq(self)
    },
  }))
  .actions(self => ({
    addBucket(model) {
      return getParentOfType(self, Domain).buckets.add({
        ...model,
        dashboard: self,
      })
    },
  }))

export const BucketM = Model({
  name: 'Bucket',
  attrs: {dashboard: types.reference(DashboardM)},
})
  .views(self => ({
    get items() {
      return Items.whereBucketEq(self)
    },
  }))
  .actions(self => ({
    addItem(model) {
      return getParentOfType(self, Domain).items.add({
        ...model,
        bucket: self,
      })
    },
  }))

const ItemM = Model({
  name: 'Item',
  attrs: {bucket: types.reference(BucketM)},
})

export const ItemC = Collection({
  model: ItemM,
}).views(self => ({
  whereBucketEq(bucket) {
    return self.whereEq({bucket})
  },
}))

export const Items = ItemC.create()

export const BucketC = Collection({
  model: BucketM,
}).views(self => ({
  whereDashboardEq(dashboard) {
    return self.whereEq({dashboard})
  },
}))
export const Buckets = BucketC.create()

export const DashboardC = Collection({
  model: DashboardM,
})

export const Dashboards = DashboardC.create()

export const Domain = types
  .model('Domain', {
    items: types.optional(ItemC, {}),
    buckets: types.optional(BucketC, {}),
    dashboards: types.optional(DashboardC, {}),
  })
  .views(domainViews)
  .actions(domainActions)

function domainViews(self) {
  return {
    collectionFromType(ct) {
      return R.cond([
        [R.equals(ItemC), constant(self.items)],
        [R.equals(BucketC), constant(self.buckets)],
        [R.equals(DashboardC), constant(self.dashboards)],
      ])(ct)
    },
  }
}

function domainActions(self) {
  return {
    add(model, collectionType) {
      return self.collectionFromType(collectionType).add(model)
    },
    addD(model) {
      return self.dashboards.add(model)
    },
  }
}
