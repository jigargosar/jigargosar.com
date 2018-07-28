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
import {hasChildren} from './relations'
import {Collection} from '../Collection'
import {extend} from '../../little-mst'

const asTreeNode = extend(self => {
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
})

const asEditable = extend(self => ({
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
}))

export const Item = C(asEditable, asTreeNode)(
  CollectionModel({
    name: 'Item',
    attrs: {parent: bucketRef()},
  }),
)

export const Bucket = C(
  hasChildren(() => Items),
  asEditable,
  asTreeNode,
)(
  CollectionModel({
    name: 'Bucket',
    attrs: {parent: dashboardRef()},
  }),
)

export const Dashboard = C(hasChildren(() => Buckets), asTreeNode)(
  CollectionModel({name: 'Dashboard'}),
)

function bucketRef() {
  return types.reference(types.late('Bucket', () => Bucket))
}

function dashboardRef() {
  return types.reference(types.late('Dashboard', () => Dashboard))
}

export const Items = Collection(Item)
export const Buckets = Collection(Bucket)
export const Dashboards = Collection(Dashboard)
