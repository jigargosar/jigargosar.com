import {getIDTypeOfModel, Model} from '../Model'
import {getRoot, getSnapshot, types} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {applySnapshot2, optionalCollections} from '../../little-mst'
import {
  dotPath,
  isIndexOutOfBounds,
  isNotNil,
  maybeOr_,
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

export function onModelFocus(m) {
  return () => getRoot(m).selectionManager.onModelFocus(m)
}

export function onModelBlur(m) {
  return () => getRoot(m).selectionManager.onModelBlur()
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

function navigateToModel(m) {
  setFocusAndSelectionOnDOMId(m.id)
}

function getFlatNavIds(model) {
  const d = Dashboard.is(model)
    ? model
    : Bucket.is(model)
      ? model.dashboard
      : Item.is(model)
        ? model.bucket.dashboard
        : (() => {
            console.error('Invalid Model', model)
            throw new Error('Invalid Model')
          })()

  return d.flatNavIds
}

function navigatePrev(model) {
  const flatNavIds = getFlatNavIds(model)
  const idx = R.indexOf(model.id)(flatNavIds)
  const prevIdx = idx === 0 ? flatNavIds.length - 1 : idx - 1

  setFocusAndSelectionOnDOMId(flatNavIds[prevIdx])
}

function navigateNext(model) {
  const flatNavIds = getFlatNavIds(model)
  const idx = R.indexOf(model.id)(flatNavIds)
  const nextIdx = idx === flatNavIds.length - 1 ? 0 : idx + 1

  setFocusAndSelectionOnDOMId(flatNavIds[nextIdx])
}

function computeFlatNavIds(navModel) {
  return [
    navModel.id,
    ...R.compose(R.flatten, R.map(c => c.flatNavIds))(
      navModel.navChildren,
    ),
  ]
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
    get navChildren() {
      return self.buckets
    },
    get flatNavIds() {
      return computeFlatNavIds(self)
    },
    get onBtnAddListKeyDown() {
      return withKeyEvent(
        whenKeyPD('up')(self.onNavigatePrev),
        whenKeyPD('down')(self.onNavigateNext),
      )
    },
  }))
  .actions(self => ({
    onNavigatePrev() {
      navigatePrev(self)
    },
    onNavigateNext() {
      navigateNext(self)
    },
    addBucket(model = {}) {
      return getDomain(self).buckets.add({
        ...model,
        dashboard: self,
      })
    },
    onMount() {
      getSelectionManager(self).onDashboardMount(self)
    },
  }))

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
      // return `bucket-header-${this.id}`
      return self.id
    },
    get items() {
      return getItemCollection(self).whereEq({bucket: self})
    },
    get navChildren() {
      return self.items
    },
    get flatNavIds() {
      return computeFlatNavIds(self)
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
      navigatePrev(self)
    },
    onHeaderNavigateNext() {
      navigateNext(self)
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
    get navChildren() {
      return []
    },
    get flatNavIds() {
      return computeFlatNavIds(self)
    },

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
    onNavigatePrev() {
      navigatePrev(self)
    },
    onNavigateNext() {
      navigateNext(self)
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

const models = [Item, Bucket, Dashboard]
const modelIDTypes = R.map(getIDTypeOfModel)(models)
const modelIDUnionType = types.union({}, ...modelIDTypes)

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedItem: types.maybeNull(types.reference(Item)),
    _selectedModelId: types.maybeNull(modelIDUnionType),
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
      navigateToModel(i)
    },
    onDashboardMount(d) {
      R.compose(
        setFocusAndSelectionOnDOMId,
        maybeOr_(() => R.compose(R.last, R.take(3))(d.flatNavIds)),
        S.toMaybe,
      )(self._selectedModelId)
    },
    onItemFocus(item) {
      self.selectedItem = item
      self.onModelFocus(item)
    },
    onItemBlur() {
      self.selectedItem = null
      self.onModelBlur()
    },
    onModelFocus(m) {
      self._selectedModelId = m.id
    },
    onModelBlur() {
      self._selectedModelId = null
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
        window.r = root
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

if (module.hot) {
  window.M = {
    Item,
    Bucket,
    Dashboard,
    Domain,
    SelectionManager,
    EditManager,
    Root,
  }

  // console.log(modelIDUnionType)
}
