import {CollectionModel} from '../CollectionModel'
import {types} from 'mobx-state-tree'
import {isEditingModel} from './helpers'
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

export const extend = fn => modelType => modelType.extend(fn)
export const actions = fn => modelType => modelType.actions(fn)
export const views = fn => modelType => modelType.views(fn)

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

const extendAsTreeNode = extend(asTreeNode)

function asEditable(self) {
  return {
    views: {
      get isEditable() {
        return true
      },
      get isEditing() {
        return isEditingModel(self)
      },
    },
    actions: {
      onInputChange: e => self.updateAttrFromEvent('name', e),
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

function dashboardRef() {
  return types.reference(types.late('Dashboard', () => Dashboard))
}

export const Bucket = CollectionModel({
  name: 'Bucket',
  attrs: {parent: dashboardRef()},
})
  .extend(asTreeNode)
  .extend(asEditable)
  .extend(hasManyChildren(() => Items))

export const Dashboard = C(
  extend(hasManyChildren(() => Buckets)),
  extendAsTreeNode,
)(CollectionModel({name: 'Dashboard'}))

export const Items = Collection(Item)
export const Buckets = Collection(Bucket)
export const Dashboards = Collection(Dashboard)
