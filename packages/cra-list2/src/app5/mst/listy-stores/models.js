import {CollectionModel} from '../CollectionModel'
import {types} from 'mobx-state-tree'
import {R} from '../../little-ramda'
import {whenKeyPD, withKeyEvent} from '../../components/utils'
import {
  endEditing,
  getBucketCollection,
  getItemCollection,
  isEditing,
  setSelectionToModel,
  startEditing,
} from './helpers'

function computeFlatNavModels(navModel) {
  return R.compose(
    R.prepend(navModel),
    R.flatten,
    R.map(R.prop('flatNavModels')),
    R.propOr([], 'children'),
  )(navModel)
}

export const Dashboard = CollectionModel({
  name: 'Dashboard',
})
  .views(self => ({
    get children() {
      return getBucketCollection(self).whereEq({
        parent: self,
      })
    },
    get flatNavModels() {
      return computeFlatNavModels(self)
    },
    get onBtnAddListKeyDown() {
      return withKeyEvent()
    },
  }))
  .actions(self => ({
    onAddBucket() {
      setSelectionToModel(self.addBucket())
    },
    addBucket(model = {}) {
      return getBucketCollection(self).add({
        ...model,
        parent: self,
      })
    },
  }))

export const Bucket = CollectionModel({
  name: 'Bucket',
  attrs: {parent: types.reference(Dashboard)},
})
  .views(self => ({
    get headerKeydownHandlers() {
      return withKeyEvent(
        whenKeyPD('mod+enter')(self.onPrependItem),
        whenKeyPD('enter')(() => alert('enter')),
        whenKeyPD('space')(() => alert('space')),
      )
    },
    get headerDOMId() {
      // return `bucket-header-${this.id}`
      return self.id
    },
    get flatNavModels() {
      return computeFlatNavModels(self)
    },
    get children() {
      return getItemCollection(self).whereEq({parent: self})
    },
  }))
  .actions(self => ({
    onHeaderKeydown(e) {
      self.headerKeydownHandlers(e)
    },
    addItem(model) {
      return getItemCollection(self).add({
        ...model,
        parent: self,
      })
    },
    onAddItem() {
      setSelectionToModel(self.addItem())
    },
    onPrependItem() {
      self.onAddItem()
    },
  }))

function updateAttrFromEvent(attr, self) {
  return function(e) {
    self.updateAttrs({[attr]: e.target.value})
  }
}

export const Item = CollectionModel({
  name: 'Item',
  attrs: {parent: types.reference(Bucket)},
})
  .views(self => ({
    get flatNavModels() {
      return computeFlatNavModels(self)
    },
    get inputDOMId() {
      return `input-${self.id}`
    },
    get onItemKeydown() {
      return withKeyEvent(
        whenKeyPD('mod+enter')(self.onAppendSibling),
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
    onInputBlur() {
      endEditing(self)
    },
    onAppendSibling() {
      self.parent.onAddItem()
    },
  }))
