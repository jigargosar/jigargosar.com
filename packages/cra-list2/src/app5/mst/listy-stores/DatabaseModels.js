import {CollectionModel} from '../CollectionModel'
import {types} from 'mobx-state-tree'
import {R} from '../../little-ramda'
import {whenKeyPD, withKeyEvent} from '../../components/utils'
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
      // R.forEach(invoke0('onDelete'))(self.items)
      // deleteFromParentCollection(self)
      self.deleteTree()
    },
  }))

function updateAttrFromEvent(attr, self) {
  return function(e) {
    self.updateAttrs({[attr]: e.target.value})
  }
}

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
        whenKeyPD('enter')(() => startEditing(self)),
        whenKeyPD('space')(() => alert('space')),
      )
    },
    get onInputKeyDown() {
      return e => {
        e.stopPropagation()
        return withKeyEvent(
          // whenKeyPD('shift+enter')(self.onAppendSibling),
          whenKeyPD('enter')(() => endEditing(self)),
        )(e)
      }
    },
    get isEditing() {
      return isEditing(self)
    },
  }))
  .actions(self => ({
    onNameChange: updateAttrFromEvent('name', self),
    onDelete() {
      self.deleteTree()
    },
    onInputBlur() {
      endEditing(self)
    },
    onAppendSibling() {
      self.bucket.onAddItem()
    },
  }))
