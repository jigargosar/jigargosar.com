import {Model} from '../Model'
import {getRoot, types} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {optionalCollections} from '../../little-mst'
import {maybeOrElse, R, S} from '../../little-ramda'
import {setFocusAndSelectionOnDOMId} from '../../components/utils'

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
  .views(self => ({
    get firstBucket() {
      return S.head(self.buckets)
    },
  }))
  .actions(self => ({
    onMount() {
      getSelectionManager(self).onDashboardMount(self)
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
    get firstItem() {
      return S.head(self.items)
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

function modelNamed(name) {
  return types.model(name)
}

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedItem: types.maybeNull(types.reference(Item)),
  })
  .views(self => ({
    get selectedItem() {
      return S.toMaybe(self._selectedItem)
    },
    set selectedItem(i) {
      self._selectedItem = i
    },
  }))
  .actions(self => ({
    onDashboardMount(d) {
      R.compose(
        S.map(R.tap(i => setFocusAndSelectionOnDOMId(i.id))),
        maybeOrElse(() => S.chain(b => b.firstItem)(d.firstBucket)),
      )(self.selectedItem)
    },
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
