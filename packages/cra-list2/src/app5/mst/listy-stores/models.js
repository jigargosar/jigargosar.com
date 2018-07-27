import {CollectionModel} from '../CollectionModel'
import {types} from 'mobx-state-tree'
import {whenKeyPD, withKeyEvent} from '../../components/utils'
import {
  endEditing,
  getBucketCollection,
  getItemCollection,
  isEditing,
  setSelectionToModel,
  startEditing,
} from './helpers'
import * as R from 'ramda'
import {nothingWhen, pOr, unlessPath} from '../../little-sanctuary'
import {C} from '../../little-ramda'

function asTreeNode(self) {
  return {
    views: {
      get flattenedTree() {
        console.log(`self.root`, self.root)
        return C(
          R.prepend(self),
          R.flatten,
          R.map(pOr([])('flattenedTree')),
          pOr([])('children'),
        )(self)
      },
      get isFirst() {
        return R.head(self.siblings) === self
      },
      get isLast() {
        return R.last(self.siblings) === self
      },
      get _nextSibling() {
        return self.siblings[self.index + 1]
      },
      get _prevSibling() {
        return self.siblings[self.index - 1]
      },
      get nextSibling() {
        return nothingWhen(R.prop('isLast'))(R.prop('_nextSibling'))(
          self,
        )
      },
      get prevSibling() {
        return nothingWhen(R.prop('isLast'))(R.prop('_prevSibling'))(
          self,
        )
      },
      get siblings() {
        return pOr([])('parent.children')(self)
      },
      get isRoot() {
        return !R.has('parent')(self)
      },
      get index() {
        console.assert(!self.isRoot)
        return R.indexOf(self)(self.siblings)
      },
      get root() {
        return unlessPath('parent.root')(self)
      },
    },
  }
}

export const Dashboard = CollectionModel({
  name: 'Dashboard',
})
  .extend(asTreeNode)
  .views(self => ({
    get children() {
      return getBucketCollection(self).whereEq({
        parent: self,
      })
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
  .extend(asTreeNode)
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
  .extend(asTreeNode)
  .views(self => ({
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
