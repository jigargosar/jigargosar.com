import {Model} from '../Model'
import {getParentOfType, types} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {constant, R} from '../../little-ramda'

function getDomain(self) {
  return getParentOfType(self, Domain)
}

export const DashboardM = Model({
  name: 'Dashboard',
})
  .views(self => ({
    get buckets() {
      return getDomain(self).buckets.whereDashboardEq(self)
    },
  }))
  .actions(self => ({
    addBucket(model) {
      return getDomain(self).buckets.add({
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
      return getDomain(self).items.whereBucketEq(self)
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

export const DashboardC = Collection({
  model: DashboardM,
})

export const BucketC = Collection({
  model: BucketM,
}).views(self => ({
  whereDashboardEq(dashboard) {
    return self.whereEq({dashboard})
  },
}))

export const Domain = types
  .model('Domain', {
    items: types.optional(ItemC, {}),
    buckets: types.optional(BucketC, {}),
    dashboards: types.optional(DashboardC, {}),
  })
  // .views(domainViews)
  .actions(domainActions)

// function domainViews(self) {
//   return {}
// }

function domainActions(self) {
  return {
    addDashboard(model) {
      return self.dashboards.add(model)
    },
  }
}
