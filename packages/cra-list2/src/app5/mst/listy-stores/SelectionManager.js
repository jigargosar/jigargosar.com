import {modelNamed, typeIs, whenTypeIs} from '../../little-mst'
import {types} from 'mobx-state-tree'
import {
  setFocusAndSelectionOnDOMId,
  whenKey,
  whenKeyPD,
  withKeyEvent,
} from '../../components/utils'
import * as R from 'ramda'
import S from 'sanctuary'
import {Bucket, Dashboard, Item} from './models'
import {getCurrentDashboard} from './helpers'
import {
  M,
  maybeOr,
  maybeOr_,
  maybeOrElse,
  P,
  sChain,
} from '../../little-sanctuary'
import {C, invoke0} from '../../little-ramda'

const modelTypes = [Item, Bucket, Dashboard]
const modelRefs = R.map(types.reference)(modelTypes)

const pSelModel = P('selectedModel')

const mapSelected = fn => C(M(fn), pSelModel)

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedModel: types.maybeNull(types.union(...modelRefs)),
    isEditing: false,
  })
  .views(self => ({
    get onKeyDown() {
      return self.isEditing
        ? self.onEditModeKeyDown
        : self.onSelectionModeKeyDown
    },
    get onEditModeKeyDown() {
      return withKeyEvent(
        whenKey('enter')(self.onEndEditSelected),
        whenKey('mod+enter')(self.onModEnter),
      )
    },
    get onSelectionModeKeyDown() {
      return withKeyEvent(
        whenKeyPD('up')(self.onNavigatePrev),
        whenKeyPD('down')(self.onNavigateNext),
        whenKeyPD('left')(self.onNavigateLeft),
        whenKeyPD('right')(self.onNavigateRight),
        whenKeyPD('d')(self.onDeleteSelectionTree),
        whenKey('enter')(self.onEditSelected),
        whenKey('mod+enter')(self.onModEnter),
      )
    },
  }))
  .views(self => ({
    isEditingModel(model) {
      return self.isEditing && self._selectedModel === model
    },
  }))
  .actions(self => ({
    onEndEditSelected() {
      console.assert(self.isEditing === true)
      self.isEditing = false
    },
    onEditSelected() {
      console.assert(self.isEditing === false)
      const _selectedModel = self._selectedModel
      if (_selectedModel && _selectedModel.isEditable) {
        self.isEditing = true
      }
    },
    startEditingModel(model) {
      if (self.isEditing) {
        self.onEndEditSelected()
      }
      self.setSelectionTo(model)
      requestAnimationFrame(() => self.onEditSelected())
    },
    onModEnter() {
      self.whenSelectedTypeIs([
        [Item, invoke0('onAppendSibling')],
        [Bucket, invoke0('onPrependChild')],
      ])
    },
  }))
  .views(self => ({
    get selectedModel() {
      return S.toMaybe(self._selectedModel)
    },
    get navModel() {
      return maybeOrElse(() => getCurrentDashboard(self))(
        self.selectedModel,
      )
    },
  }))
  .actions(self => ({
    clearSelection() {
      self._selectedModel = null
      self.isEditing = false
    },
    mapSelected(fn) {
      mapSelected(fn)(self)
    },
    whenSelectedTypeIs(conditions) {
      self.mapSelected(whenTypeIs(conditions))
    },
    onDeleteSelectionTree() {
      self.mapSelected(m => {
        self.clearSelection()
        m.deleteTree()
      })
    },
    setSelectionTo(m) {
      self._selectedModel = m
      setFocusAndSelectionOnDOMId(m.id)
    },
    onModelFocus(m) {
      self._selectedModel = m
    },
    onDashboardMount(d) {
      C(
        self.setSelectionTo,
        maybeOr_(() => C(R.last, R.take(3))(d.flattenedTree)),
      )(self.selectedModel)
    },
    navigate(fn) {
      C(S.map(self.setSelectionTo), S.map(fn))(self.navModel)
    },
    onNavigateNext: () => self.navigate(getNextNode),
    onNavigatePrev: () => self.navigate(getPrevNode),
    onNavigateLeft: () => self.navigate(getLeftNode),
    onNavigateRight: () => self.navigate(getRightNode),
  }))

function getNextNode(m) {
  return C(
    maybeOr_(() => m.root),
    maybeOrElse(() => getNextSiblingOrThatOfFirstAncestor(m)),
  )(m.firstChild)

  function getNextSiblingOrThatOfFirstAncestor(m) {
    return C(
      maybeOrElse(() =>
        sChain(getNextSiblingOrThatOfFirstAncestor)(m.maybeParent),
      ),
    )(m.nextSibling)
  }
}

function getPrevNode(m) {
  return C(
    maybeOr_(() => lastLeafOrSelf(m.root)),
    maybeOrElse(() => m.maybeParent),
    S.map(lastLeafOrSelf),
  )(m.prevSibling)

  function lastLeafOrSelf(m) {
    return C(maybeOr_(() => m), S.map(lastLeafOrSelf), S.last)(
      m.children,
    )
  }
}

function getLeftNode(m) {
  return C(
    maybeOr(m.root),
    R.cond([
      [
        typeIs(Item),
        m =>
          S.map(p => p.childAtIdxOrLastOrSelf(m.index))(
            m.parent.prevSibling,
          ),
      ],
      [typeIs(Bucket), m => m.prevSibling],
      [typeIs(Dashboard), m => m.lastChild],
    ]),
  )(m)
}

function getRightNode(m) {
  return C(
    maybeOr(m.root),
    R.cond([
      [
        typeIs(Item),
        m =>
          S.map(p => p.childAtIdxOrLastOrSelf(m.index))(
            m.parent.nextSibling,
          ),
      ],
      [typeIs(Bucket), m => m.nextSibling],
      [typeIs(Dashboard), m => m.firstChild],
    ]),
  )(m)
}
