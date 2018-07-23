import {Model} from '../Model'
import {getRoot, getSnapshot, types} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {applySnapshot2, optionalCollections} from '../../little-mst'
import {
  dotPath,
  isIndexOutOfBounds,
  isNotNil,
  maybeOrElse,
  R,
} from '../../little-ramda'
import {setFocusAndSelectionOnDOMId} from '../../components/utils'
import assert from 'assert'
import S from 'sanctuary'
import {domain} from './index'

function getSelectionManager(self) {
  return getRoot(self).selectionManager
}

function getDomain(self) {
  return getRoot(self).domain
}
function getItemCollection(self) {
  return getDomain(self).items
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
    onDelete() {
      getDomain(self).deleteBucket(self)
    },
  }))

const Item = Model({
  name: 'Item',
  attrs: {bucket: types.reference(Bucket)},
})
  .views(self => ({
    get siblings() {
      return self.bucket.items
    },
    get index() {
      const index = R.indexOf(self, self.siblings)
      assert(!isIndexOutOfBounds(index, self.siblings))
      return index
    },
    get isLast() {
      return self.index === self.siblings.length - 1
    },
    get isFirst() {
      return self.index === 0
    },
  }))
  .actions(self => ({
    onFocus() {
      getSelectionManager(self).onItemFocus(self)
    },
    onBlur() {
      getSelectionManager(self).onItemBlur()
    },
    onNavigateNext() {
      if (self.isLast) {
      } else {
        getSelectionManager(self).selectItem(
          self.siblings[self.index + 1],
        )
      }
    },
    onNavigatePrev() {
      if (self.isFirst) {
      } else {
        getSelectionManager(self).selectItem(
          self.siblings[self.index - 1],
        )
      }
    },
    appendSibling() {
      getSelectionManager(self).selectItem(self.bucket.addItem())
    },
  }))

const collectionProps = {
  items: Collection(Item),
  buckets: Collection(Bucket),
  dashboards: Collection(Dashboard),
}

export const Domain = modelNamed('Domain')
  .props(optionalCollections(collectionProps))
  .views(function(self) {
    return {
      get currentDashboard() {
        return S.head(getDashboardCollection(self).list)
      },
    }
  })
  .actions(function(self) {
    return {
      addDashboard(model) {
        return getDashboardCollection(self).add(model)
      },
      deleteBucket(b) {
        self.items.deleteAll(b.items)
        self.buckets.delete(b)
      },
      addMockData() {
        self
          .addDashboard({})
          .addBucket()
          .addItem()
      },
    }
  })

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
    selectItem(i) {
      setFocusAndSelectionOnDOMId(i.id)
    },
    onDashboardMount(d) {
      R.compose(
        S.map(R.tap(self.selectItem)),
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

export const Root = types
  .model('Root')
  .props({
    domain: types.optional(Domain, {}),
    selectionManager: types.optional(SelectionManager, {}),
  })
  .actions(self => ({
    initModule(module) {
      if (module.hot) {
        domain.addMockData()

        const rootSnap = dotPath('hot.data.rootSnap')(module)
        R.ifElse(isNotNil)(applySnapshot2(root))(domain.addMockData)(
          rootSnap,
        )

        module.hot.dispose(
          data => (data.rootSnap = getSnapshot(root)),
        )
      }
    },
  }))
