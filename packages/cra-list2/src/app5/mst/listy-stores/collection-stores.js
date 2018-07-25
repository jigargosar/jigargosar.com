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
import {
  setFocusAndSelectionOnDOMId,
  whenKeyPD,
  withKeyEvent,
} from '../../components/utils'
import assert from 'assert'
import S from 'sanctuary'

function getSelectionManager(self) {
  return getRoot(self).selectionManager
}

function getEditManager(self) {
  return getRoot(self).editManager
}

function startEditing(self) {
  getEditManager(self).startEditing(self)
}

function endEditing(self) {
  getEditManager(self).endEditing(self)
}

function isEditing(self) {
  return getEditManager(self).isEditing(self)
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

function navigateToMaybeBucketHeader(maybeBucket) {
  S.map(R.tap(b => b.navigateToHeader()))(maybeBucket)
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
    get firstBucket() {
      return S.head(self.buckets)
    },
    get lastBucket() {
      return S.last(self.buckets)
    },
    get btnAddListDOMId() {
      return `'add-list-button-${self.id}`
    },
    get onBtnAddListKeyDown() {
      return withKeyEvent(
        whenKeyPD('up')(() =>
          navToLastItemOrHeadOfMaybeBucket(self.lastBucket),
        ),
        whenKeyPD('down')(() =>
          navigateToMaybeBucketHeader(self.firstBucket),
        ),
      )
    },
  }))
  .actions(self => ({
    addBucket(model = {}) {
      return getDomain(self).buckets.add({
        ...model,
        dashboard: self,
      })
    },
    onMount() {
      getSelectionManager(self).onDashboardMount(self)
    },
    navigateToAddListButton() {
      setFocusAndSelectionOnDOMId(self.btnAddListDOMId)
    },
  }))

function navToLastItemOrHeadOfMaybeBucket(bucket) {
  return R.compose(
    maybeOrElse(() => navigateToMaybeBucketHeader(bucket)),
    S.map(R.tap(i => i.navigateTo())),
    S.chain(b => b.lastItem),
  )(bucket)
}

const Bucket = Model({
  name: 'Bucket',
  attrs: {dashboard: types.reference(Dashboard)},
})
  .views(self => ({
    get onHeaderKeydown() {
      return withKeyEvent(
        whenKeyPD('up')(self.onHeaderNavigatePrev),
        whenKeyPD('down')(self.onHeaderNavigateNext),
        whenKeyPD('d')(self.onDelete),
        whenKeyPD('mod+enter')(self.onPrependItem),
        whenKeyPD('enter')(() => alert('enter')),
        whenKeyPD('space')(() => alert('space')),
      )
    },
    get headerDOMId() {
      return `bucket-header-${this.id}`
    },
    get items() {
      return getItemCollection(self).whereEq({bucket: self})
    },
    get firstItem() {
      return S.head(self.items)
    },
    get lastItem() {
      return S.last(self.items)
    },
    get siblings() {
      return self.dashboard.buckets
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

    get nextBucket() {
      return S.toMaybe(
        self.isLast ? null : self.siblings[self.index + 1],
      )
    },
    get prevBucket() {
      return S.toMaybe(
        self.isFirst ? null : self.siblings[self.index - 1],
      )
    },
  }))
  .actions(self => ({
    addItem(model) {
      return getItemCollection(self).add({
        ...model,
        bucket: self,
      })
    },
    onAddItem() {
      self.addItem().navigateTo()
    },
    onPrependItem() {
      self.onAddItem()
    },
    onDelete() {
      getDomain(self).deleteBucket(self)
    },
    onHeaderNavigatePrev() {
      navToLastItemOrHeadOfMaybeBucket(self.prevBucket)
    },
    onHeaderNavigateNext() {
      R.compose(
        maybeOrElse(() => self.navigateToNextBucketHeader()),
        S.map(R.tap(i => i.navigateTo())),
      )(self.firstItem)
    },
    navigateToNextBucketHeader() {
      navigateToMaybeBucketHeader(self.nextBucket)
    },
    navigateToHeader() {
      setFocusAndSelectionOnDOMId(self.headerDOMId)
    },
  }))

const Item = Model({
  name: 'Item',
  attrs: {bucket: types.reference(Bucket)},
})
  .views(self => ({
    get inputDOMId() {
      return `input-${self.id}`
    },
    get onLIKeydown() {
      return withKeyEvent(
        whenKeyPD('up')(self.onNavigatePrev),
        whenKeyPD('down')(self.onNavigateNext),
        whenKeyPD('mod+enter')(self.onAppendSibling),
        whenKeyPD('d')(self.onDelete),
        whenKeyPD('enter')(self.onStartEditing),
        whenKeyPD('space')(() => alert('space')),
      )
    },
    get onInputKeyDown() {
      return e => {
        e.stopPropagation()
        return withKeyEvent(
          // whenKeyPD('shift+enter')(self.onAppendSibling),
          whenKeyPD('enter')(self.onEndEditing),
        )(e)
      }
    },
    get isEditing() {
      return isEditing(self)
    },
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
    onStartEditing() {
      startEditing(self)
      setFocusAndSelectionOnDOMId(self.inputDOMId)
    },
    onEndEditing() {
      endEditing(self)
    },
    onInputChange(e) {
      const text = e.target.value
      self.name = text
    },
    navigateTo() {
      getSelectionManager(self).selectItem(self)
    },
    onDelete() {
      getDomain(self).deleteItem(self)
    },
    onFocus() {
      getSelectionManager(self).onItemFocus(self)
    },
    onBlur() {
      getSelectionManager(self).onItemBlur()
    },
    onInputBlur() {
      endEditing(self)
    },
    onInputFocus() {
      getSelectionManager(self).onItemFocus(self)
    },
    onNavigateNext() {
      if (self.isLast) {
        self.bucket.navigateToNextBucketHeader()
      } else {
        self.siblings[self.index + 1].navigateTo()
      }
    },
    onNavigatePrev() {
      if (self.isFirst) {
        self.bucket.navigateToHeader()
      } else {
        self.siblings[self.index - 1].navigateTo()
      }
    },
    onAppendSibling() {
      self.bucket.onAddItem()
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
      addDashboard(model = {}) {
        return getDashboardCollection(self).add(model)
      },
      deleteBucket(b) {
        self.items.deleteAll(b.items)
        self.buckets.delete(b)
      },
      deleteItem(i) {
        self.items.delete(i)
      },
      addMockData() {
        self
          .addDashboard()
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

export const EditManager = modelNamed('EditManager')
  .props({
    _editId: types.maybeNull(types.string),
  })
  .views(self => ({
    get editRef() {
      return S.toMaybe(self._editId)
    },
    set editRef(ref) {
      self._editId = ref.id
    },
    isEditing(ref) {
      return self._editId === ref.id
    },
  }))
  .actions(self => ({
    startEditing(ref) {
      self.editRef = ref
    },
    endEditing(ref) {
      if (self.isEditing(ref)) {
        self._editId = null
      }
    },
  }))

export const Root = types
  .model('Root')
  .props({
    domain: types.optional(Domain, {}),
    selectionManager: types.optional(SelectionManager, {}),
    editManager: types.optional(EditManager, {}),
  })
  .actions(self => ({
    initModule(module) {
      if (module.hot) {
        const root = self
        const domain = getDomain(self)

        const snapKey = Root.name
        const snap = dotPath(`hot.data.${snapKey}`)(module)
        R.ifElse(isNotNil)(applySnapshot2(root))(domain.addMockData)(
          snap,
        )

        module.hot.dispose(
          data => (data[snapKey] = getSnapshot(root)),
        )
      }
    },
  }))
