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
import {C, invoke0, isNotNil} from '../../little-ramda'

const modelTypes = [Item, Bucket, Dashboard]
const modelRefs = R.map(types.reference)(modelTypes)

const pSelModel = P('selectedModel')

const mapSelected = fn => C(M(fn), pSelModel)
const whenSelectedTypeIs = C(mapSelected, whenTypeIs)

const onModEnter = whenSelectedTypeIs([
  [Item, invoke0('onAppendSibling')],
  [Bucket, invoke0('onPrependChild')],
])

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
    get selectionModeKeyDownHandler() {
      return withKeyEvent(
        whenKeyPD('up')(self.onNavigatePrev),
        whenKeyPD('down')(self.onNavigateNext),
        whenKeyPD('left')(self.onNavigateLeft),
        whenKeyPD('right')(self.onNavigateRight),
        whenKeyPD('d')(self.onDeleteSelectionTree),
        whenKey('enter')(self.onEditSelected),
        whenKey('mod+enter')(() => onModEnter(self)),
      )
    },
  }))
  .views(self => ({
    isEditingModel(model) {
      return self.isEditing && self._selectedModel === model
    },
  }))
  .actions(self => ({
    onSelectionModeKeyDown(e) {
      self.selectionModeKeyDownHandler(e)
    },
    onEndEditSelected() {
      console.assert(self.isEditing === true)
      self.isEditing = false
      self.focusSelected()
    },
    onEditSelected() {
      console.assert(self.isEditing === false)
      self.editSelected()
    },
    editSelected() {
      const _selectedModel = self._selectedModel
      self.isEditing = !!(_selectedModel && _selectedModel.isEditable)
    },
    startEditingModel(model) {
      self._selectedModel = model
      self.editSelected()
    },
    onModEnter: () => onModEnter(self),
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
    onDeleteSelectionTree() {
      self.mapSelected(m => {
        self.clearSelection()
        m.deleteTree()
      })
    },
    focusSelected: () => {
      console.assert(isNotNil(self._selectedModel))
      return setFocusAndSelectionOnDOMId(self._selectedModel.id)
    },
    setSelectionTo(m) {
      self._selectedModel = m
      self.focusSelected()
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
