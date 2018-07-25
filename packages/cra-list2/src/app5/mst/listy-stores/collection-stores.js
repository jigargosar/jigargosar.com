import {Model} from '../Model'
import {types} from 'mobx-state-tree'
import {R} from '../../little-ramda'
import {
  setFocusAndSelectionOnDOMId,
  whenKeyPD,
  withKeyEvent,
} from '../../components/utils'
import {
  endEditing,
  getBucketCollection,
  getDomain,
  getItemCollection,
  isEditing,
  navigateNext,
  navigatePrev,
  setSelectionToModel,
  startEditing,
} from './helpers'

function computeFlatNavIds(navModel, navChildren) {
  return [
    navModel.id,
    ...R.compose(R.flatten, R.map(c => c.flatNavIds))(navChildren),
  ]
}

export const Dashboard = Model({
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
  }))

export const Bucket = Model({
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
      setSelectionToModel(self.addItem())
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

export const Item = Model({
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
    onInputBlur() {
      endEditing(self)
    },
    onInputFocus() {
      setSelectionToModel(self)
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
