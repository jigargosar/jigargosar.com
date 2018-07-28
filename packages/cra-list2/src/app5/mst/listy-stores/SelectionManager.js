import {modelNamed, typeIs} from '../../little-mst'
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
import {getCurrentDashboard, isEditingModel} from './helpers'
import {
  maybeOr,
  maybeOr_,
  maybeOrElse,
  sChain,
} from '../../little-sanctuary'
import {C} from '../../little-ramda'

const modelTypes = [Item, Bucket, Dashboard]

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedModel: types.maybeNull(
      types.union(...R.map(types.reference)(modelTypes)),
    ),
    _isEditing: false,
  })
  .views(self => ({
    get onKeyDown() {
      return self._isEditing
        ? self.onEditModeKeyDown
        : self.onSelectionModeKeyDown
    },
    get onEditModeKeyDown() {
      return {}
    },
    get onSelectionModeKeyDown() {
      return withKeyEvent(
        whenKeyPD('up')(self.onNavigatePrev),
        whenKeyPD('down')(self.onNavigateNext),
        whenKeyPD('left')(self.onNavigateLeft),
        whenKeyPD('right')(self.onNavigateRight),
        whenKeyPD('d')(self.onDeleteSelectionTree),
        whenKey('enter')(self.onEditSelected),
      )
    },
  }))
  .views(self => ({
    isEditingModel(model) {
      return self._isEditing && self._selectedModel === model
    },
  }))
  .actions(self => ({
    endEditing(ref) {
      if (self.isEditingModel(ref)) {
        self._isEditing = false
      }
    },
    onEditSelected(e) {
      const _selectedModel = self._selectedModel
      if (_selectedModel && _selectedModel.isEditable) {
        e.preventDefault()
        self._isEditing = true
      }
    },
  }))
  .views(self => ({
    get selectedModel() {
      return S.toMaybe(self._selectedModel)
    },
    get selectedModelOrCurrentDashboard() {
      return maybeOrElse(() => getCurrentDashboard(self))(
        self.selectedModel,
      )
    },
  }))
  .actions(self => ({
    clearSelection() {
      self._selectedModel = null
      self._isEditing = false
    },
    onDeleteSelectionTree() {
      const _selectedModel = self._selectedModel
      if (_selectedModel && !isEditingModel(_selectedModel)) {
        self.clearSelection()
        _selectedModel.deleteTree()
      }
    },
    setSelectionToModel(m) {
      self._selectedModel = m
      setFocusAndSelectionOnDOMId(m.id)
    },
    setSelectionToMaybeModel(mm) {
      S.map(R.tap(self.setSelectionToModel))(mm)
    },
    onDashboardMount(d) {
      R.compose(
        self.setSelectionToModel,
        maybeOr_(() => R.compose(R.last, R.take(3))(d.flattenedTree)),
      )(self.selectedModel)
    },
    onModelFocus(m) {
      self._selectedModel = m
    },
    onModelBlur() {
      // self.clearSelection()
    },
    navigate(fn) {
      const next = S.map(fn)(self.selectedModelOrCurrentDashboard)
      self.setSelectionToMaybeModel(next)
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
