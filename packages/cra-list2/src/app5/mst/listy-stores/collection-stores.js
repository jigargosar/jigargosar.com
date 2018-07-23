import {Model} from '../Model'
import {
  getParentOfType,
  getRoot,
  getType,
  types,
} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {optionalCollections} from '../../little-mst'
import {S} from '../../little-ramda'

function getSelectionManager(self) {
  return getRoot(self).selectionManager
}

function getDomain(self) {
  return getRoot(self).domain
}
function getItemCollection(self) {
  return getDomain(self).itemCollection
}

function getDashboardCollection(self) {
  return getDomain(self).dashboards
}

const Dashboard = Model({
  name: 'Dashboard',
})
  .views(self => ({
    get buckets() {
      return getDomain(self).buckets.whereEq({
        dashboard: self,
      })
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

const Bucket = Model({
  name: 'Bucket',
  attrs: {dashboard: types.reference(Dashboard)},
})
  .views(self => ({
    get items() {
      return getItemCollection(self).whereEq({bucket: self})
    },
  }))
  .actions(self => ({
    addItem(model) {
      return getItemCollection(self).add({
        ...model,
        bucket: self,
      })
    },
  }))

const Item = Model({
  name: 'Item',
  attrs: {bucket: types.reference(Bucket)},
}).actions(self => ({
  onFocus() {
    getSelectionManager(self).onItemFocus(self)
  },
  onBlur() {
    getSelectionManager(self).onItemBlur()
  },
}))

const collectionProps = {
  itemCollection: Collection(Item),
  buckets: Collection(Bucket),
  dashboards: Collection(Dashboard),
}

export const Domain = types
  .model('Domain')
  .props(optionalCollections(collectionProps))
  .views(domainViews)
  .actions(domainActions)

function domainViews(self) {
  return {
    get currentDashboard() {
      return S.head(getDashboardCollection(self).list)
    },
  }
}

function domainActions(self) {
  return {
    addDashboard(model) {
      return getDashboardCollection(self).add(model)
    },
    addMockData() {
      self
        .addDashboard({})
        .addBucket()
        .addItem()
    },
  }
}

export const SelectionManager = types
  .model('SelectionManager')
  .props({
    selectedItem: types.maybeNull(types.reference(Item)),
  })
  .actions(self => ({
    onItemFocus(item) {
      self.selectedItem = item
    },
    onItemBlur() {
      self.selectedItem = null
    },
  }))

export const Root = types.model('Root').props({
  domain: types.optional(Domain, {}),
  selectionManager: types.optional(SelectionManager, {}),
})
