import {modelNamed, typeIs, whenTypeIs} from '../../little-mst'
import {types} from 'mobx-state-tree'
import {
  isHotKey,
  setFocusAndSelectionOnDOMId,
  whenKey,
  withKeyEvent,
  wrapPD,
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
import {C, invoke0, isNotNil, throttle} from '../../little-ramda'
import {oBox} from '../../mobx/little-mobx'

const isEventHotKey = e => k => isHotKey(k, e)
const fst = P('0')
const snd = P('1')

const modelTypes = [Item, Bucket, Dashboard]
const modelRefs = R.map(types.reference)(modelTypes)

const pSelModel = P('selectedModel')

const mapSelected = fn => C(M(fn), pSelModel)
const whenSelectedTypeIs = C(mapSelected, whenTypeIs)

const onModEnter = whenSelectedTypeIs([
  [Item, invoke0('onAppendSibling')],
  [Bucket, invoke0('onPrependChild')],
])

const findHotKeyAction = e => keymap =>
  C(M(snd), S.find(C(isEventHotKey(e), fst)))(keymap)

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedModel: types.maybeNull(types.union(...modelRefs)),
    isEditing: false,
  })
  .extend(self => {
    const selectionModeKeyMap = oBox([])
    return {
      actions: {
        afterCreate() {
          console.warn('selectionModeKeyMap')
          const pdThrottle = C(wrapPD, fn =>
            throttle(fn, 50, {leading: true, trailing: false}),
          )
          selectionModeKeyMap.set([
            ['up', pdThrottle(self.onNavigatePrev)],
            ['down', pdThrottle(self.onNavigateNext)],
            ['left', pdThrottle(self.onNavigateLeft)],
            ['right', pdThrottle(self.onNavigateRight)],
            ['d', self.onDeleteSelectionTree],
            ['enter', self.onEditSelected],
            ['mod+enter', self.onModEnter],
          ])
        },
      },
      views: {
        get selectionModeKeyMap() {
          return selectionModeKeyMap.get()
        },
      },
    }
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
  }))
  .views(self => ({
    isEditingModel(model) {
      return self.isEditing && self._selectedModel === model
    },
  }))
  .actions(self => ({
    executeActionNamed(name) {
      self[name]()
    },
    onSelectionModeKeyDown(e) {
      const action = findHotKeyAction(e)(self.selectionModeKeyMap)
      M(S.T(e))(action)
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
