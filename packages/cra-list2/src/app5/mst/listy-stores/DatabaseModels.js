import {CollectionModel} from '../CollectionModel'
import {getParent, types} from 'mobx-state-tree'
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
  setSelectionToModel,
  startEditing,
} from './helpers'

function computeFlatNavIds(navModel, navChildren) {
  return R.compose(
    R.prepend(navModel.id),
    R.flatten,
    R.map(R.prop('flatNavIds')),
  )(navChildren)
}

function deleteFromParentCollection(m) {
  getParent(m, 2).delete(m)
}

export const Dashboard = CollectionModel({
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
      return withKeyEvent()
    },
  }))
  .actions(self => ({
    addBucket(model = {}) {
      return getBucketCollection(self).add({
        ...model,
        dashboard: self,
      })
    },
  }))

export const Bucket = CollectionModel({
  name: 'Bucket',
  attrs: {dashboard: types.reference(Dashboard)},
})
  .views(self => ({
    get headerKeydownHandlers() {
      return withKeyEvent(
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
    get children() {
      return self.items
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
      R.forEach(R.invoker(0, 'onDelete'))(self.items)
      deleteFromParentCollection(self)
    },
  }))

export const Item = CollectionModel({
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
      deleteFromParentCollection(self)
    },
    onInputBlur() {
      endEditing(self)
    },
    onAppendSibling() {
      self.bucket.onAddItem()
    },
  }))
