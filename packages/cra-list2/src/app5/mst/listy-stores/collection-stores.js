import {getIDTypeOfModel, Model} from '../Model'
import {types} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {modelNamed, optionalCollections} from '../../little-mst'
import {maybeOr_, R} from '../../little-ramda'
import {
  setFocusAndSelectionOnDOMId,
  whenKeyPD,
  withKeyEvent,
} from '../../components/utils'
import S from 'sanctuary'
import {getDomain, getEditManager, getSelectionManager} from './Root'

function navigateToModel(m) {
  setFocusAndSelectionOnDOMId(m.id)
}

function getParentDashboard(model) {
  return Dashboard.is(model)
    ? model
    : Bucket.is(model)
      ? model.dashboard
      : Item.is(model)
        ? model.bucket.dashboard
        : (() => {
            console.error('Invalid Model', model)
            throw new Error('Invalid Model')
          })()
}

function getFlatNavIds(model) {
  return getParentDashboard(model).flatNavIds
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

function computeFlatNavIds(navModel, navChildren) {
  return [
    navModel.id,
    ...R.compose(R.flatten, R.map(c => c.flatNavIds))(navChildren),
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
    get flatNavIds() {
      return computeFlatNavIds(self, self.buckets)
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
      return getBucketCollection(self).add({
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
    get headerKeydownHandlers() {
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
    get flatNavIds() {
      return computeFlatNavIds(self, self.items)
    },
  }))
  .actions(self => ({
    onHeaderKeydown(e) {
      self.headerKeydownHandlers(e)
    },
    addItem(model) {
      return getItemCollection(self).add({
        ...model,
        bucket: self,
      })
    },
    onAddItem() {
      navigateToModel(self.addItem())
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
  }))

const Item = Model({
  name: 'Item',
  attrs: {bucket: types.reference(Bucket)},
})
  .views(self => ({
    get flatNavIds() {
      return computeFlatNavIds(self, [])
    },
    get inputDOMId() {
      return `input-${self.id}`
    },
    get onItemKeydown() {
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

function getItemCollection(self) {
  return getDomain(self).items
}

function getDashboardCollection(self) {
  return getDomain(self).dashboards
}

function getBucketCollection(self) {
  return getDomain(self).buckets
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
    }
  })

const models = [Item, Bucket, Dashboard]
const modelIDTypes = R.map(getIDTypeOfModel)(models)
const modelIDUnionType = types.union({}, ...modelIDTypes)

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedModelId: types.maybeNull(modelIDUnionType),
  })
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
      self.onModelFocus(item)
    },
    onItemBlur() {
      self.onModelBlur()
    },
    onModelFocus(m) {
      self._selectedModelId = m.id
    },
    onModelBlur() {
      self._selectedModelId = null
    },
  }))

function startEditing(self) {
  getEditManager(self).startEditing(self)
}

function endEditing(self) {
  getEditManager(self).endEditing(self)
}

function isEditing(self) {
  return getEditManager(self).isEditing(self)
}

export const EditManager = modelNamed('EditManager')
  .props({
    _editId: types.maybeNull(types.string),
  })
  .views(self => ({
    isEditing(ref) {
      return self._editId === ref.id
    },
  }))
  .actions(self => ({
    startEditing(model) {
      self._editId = model.id
    },
    endEditing(ref) {
      if (self.isEditing(ref)) {
        self._editId = null
      }
    },
  }))
