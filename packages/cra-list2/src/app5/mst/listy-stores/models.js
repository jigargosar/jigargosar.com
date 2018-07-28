import {CollectionModel} from '../CollectionModel'
import {types} from 'mobx-state-tree'
import {whenKeyPD, withKeyEvent} from '../../components/utils'
import {
  endEditing,
  getCollection,
  isEditing,
  setSelectionToModel,
  startEditing,
} from './helpers'
import * as R from 'ramda'
import {
  dotPathOr,
  elemAt,
  maybeOr,
  maybeOrElse,
  nothingWhen,
  S,
  sChain,
  sGets,
  toMaybe,
  unlessPath,
} from '../../little-sanctuary'
import {C} from '../../little-ramda'

function asTreeNode(self) {
  const computeChildren = self => dotPathOr([])('children')(self)

  return {
    views: {
      get flattenedTree() {
        return C(
          R.prepend(self),
          R.flatten,
          R.map(R.prop('flattenedTree')),
          R.prop('children'),
        )(self)
      },

      get maybeParent() {
        return toMaybe(self.parent)
      },
      get firstChild() {
        return C(S.head, computeChildren)(self)
      },

      get lastChild() {
        return C(S.last, computeChildren)(self)
      },
      get nextSibling() {
        return sChain(idx => elemAt(idx + 1)(self.siblings))(
          self.index,
        )
      },
      get prevSibling() {
        return sChain(idx => elemAt(idx - 1)(self.siblings))(
          self.index,
        )
      },
      get siblings() {
        return maybeOr([])(sGets(R.T)(['parent', 'children'])(self))
      },
      get isRoot() {
        return !R.has('parent')(self)
      },
      get index() {
        const idx = R.indexOf(self)(self.siblings)
        return nothingWhen(R.equals(-1))(idx)
      },
      get root() {
        return unlessPath('parent.root')(self)
      },
      childAtIdxOrLastOrSelf(index) {
        return C(
          maybeOr(self),
          maybeOrElse(() => self.lastChild),
          sChain(idx => elemAt(idx)(computeChildren(self))),
        )(index)
      },
    },
    actions: {},
  }
}

function asEditable(self) {
  return {
    views: {
      get isEditing() {
        return isEditing(self)
      },
      get isEditable() {
        return true
      },
      get onInputKeyDown() {
        return e => {
          e.stopPropagation()
          return withKeyEvent(whenKeyPD('enter')(self.endEditing))(e)
        }
      },
    },
    actions: {
      onNameChange: self.updateAttrFromEvent('name'),
      onInputBlur: self.endEditing,
      endEditing: () => endEditing(self),
      startEditing: () => startEditing(self),
    },
  }
}

function hasMany(modelType) {
  return self => ({
    views: {
      get children() {
        return getCollection(self, modelType).whereEq({
          parent: self,
        })
      },
    },
    actions: {
      onAddChild() {
        setSelectionToModel(self.addChild())
      },
      addChild(model = {}) {
        return getCollection(self, modelType).add({
          ...model,
          parent: self,
        })
      },
    },
  })
}

export const Item = CollectionModel({
  name: 'Item',
  attrs: {parent: types.reference(types.late(() => Bucket))},
})
  .extend(asTreeNode)
  .extend(asEditable)
  .views(self => ({
    get onItemKeydown() {
      return withKeyEvent(
        whenKeyPD('mod+enter')(self.onAppendSibling),
        whenKeyPD('enter')(self.startEditing),
        whenKeyPD('space')(() => alert('space')),
      )
    },
  }))
  .actions(self => ({
    onAppendSibling() {
      self.parent.onAddItem()
    },
  }))

export const Bucket = CollectionModel({
  name: 'Bucket',
  attrs: {parent: types.reference(types.late(() => Dashboard))},
})
  .extend(asTreeNode)
  .extend(asEditable)
  .views(self => ({
    get onHeaderKeydown() {
      return withKeyEvent(
        whenKeyPD('mod+enter')(self.onPrependItem),
        whenKeyPD('enter')(self.startEditing),
        whenKeyPD('space')(() => alert('space')),
      )
    },
    get headerDOMId() {
      // return `bucket-header-${this.id}`
      return self.id
    },
    get children() {
      return getCollection(self, Item).whereEq({parent: self})
    },
  }))
  .actions(self => ({
    addItem(model) {
      return getCollection(self, Item).add({
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

export const Dashboard = CollectionModel({
  name: 'Dashboard',
})
  .extend(asTreeNode)
  .extend(hasMany(Bucket))
  .actions(self => ({
    onAddBucket() {
      setSelectionToModel(self.addBucket())
    },
    addBucket(model = {}) {
      return getCollection(self, Bucket).add({
        ...model,
        parent: self,
      })
    },
  }))
