import {Model} from '../Model'
import {getParentOfType, types} from 'mobx-state-tree'
import {Collection} from '../Collection'

function getDomain(self) {
  return getParentOfType(self, Domain)
}

const DashboardM = Model({
  name: 'Dashboard',
})
  .views(self => ({
    get buckets() {
      return getDomain(self).buckets.whereEq({dashboard: self})
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

const BucketM = Model({
  name: 'Bucket',
  attrs: {dashboard: types.reference(DashboardM)},
})
  .views(self => ({
    get items() {
      return getDomain(self).items.whereEq({bucket: self})
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

const DashboardC = Collection({
  model: DashboardM,
})

const BucketC = Collection({
  model: BucketM,
})

const ItemC = Collection({
  model: ItemM,
})

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
