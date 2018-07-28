import {CollectionModel} from '../CollectionModel'
import {types} from 'mobx-state-tree'
import {whenKeyPD, withKeyEvent} from '../../components/utils'
import {endEditing, isEditing, startEditing} from './helpers'
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
import {hasManyChildren} from './hasManyChildren'
import {Collection} from '../Collection'

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
      onInputChange: e => self.updateAttrFromEvent('name', e),
      onInputBlur: () => self.endEditing(),
      endEditing: () => endEditing(self),
      startEditing: () => startEditing(self),
    },
  }
}

export const Item = CollectionModel({
  name: 'Item',
  attrs: {
    parent: types.reference(types.late('Bucket', () => Bucket)),
  },
})
  .extend(asTreeNode)
  .extend(asEditable)
  .views(self => ({
    get onKeydown() {
      return withKeyEvent(
        whenKeyPD('mod+enter')(self.onAppendSibling),
        whenKeyPD('enter')(self.startEditing),
        whenKeyPD('space')(() => alert('space')),
      )
    },
  }))
  .actions(self => ({
    onAppendSibling() {
      self.parent.onAddChild()
    },
  }))

export const Bucket = CollectionModel({
  name: 'Bucket',
  attrs: {
    parent: types.reference(types.late('Dashboard', () => Dashboard)),
  },
})
  .extend(asTreeNode)
  .extend(asEditable)
  .extend(hasManyChildren(() => ItemsCollection))
  .views(self => {
    const onSuperKeydown = R.defaultTo(R.identity)(self.onKeydown)
    return {
      get onKeydown() {
        return C(
          onSuperKeydown,
          withKeyEvent(
            whenKeyPD('mod+enter')(self.onPrependChild),
            whenKeyPD('enter')(self.startEditing),
            whenKeyPD('space')(() => alert('space')),
          ),
        )
      },
    }
  })

export const Dashboard = CollectionModel({
  name: 'Dashboard',
})
  .extend(asTreeNode)
  .extend(hasManyChildren(() => BucketsCollection))

export const ItemsCollection = Collection(Item)
export const BucketsCollection = Collection(Bucket)
export const DashboardsCollection = Collection(Dashboard)
