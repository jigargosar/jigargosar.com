import {modelNamed, typeIs} from '../../little-mst'
import {types} from 'mobx-state-tree'
import {setFocusAndSelectionOnDOMId} from '../../components/utils'
import * as R from 'ramda'
import S from 'sanctuary'
import {Bucket, Dashboard, Item} from './models'
import {getCurrentDashboard} from './helpers'
import {
  dotPath,
  maybeOr,
  maybeOr_,
  maybeOrElse,
  sChain,
  tapShow,
  toMaybe,
} from '../../little-sanctuary'
import {C, tapDebug} from '../../little-ramda'

const modelTypes = [Item, Bucket, Dashboard]

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedModel: types.maybeNull(
      types.union(...R.map(types.reference)(modelTypes)),
    ),
  })
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
    },
    deleteSelectionTree() {
      const _selectedModel = self._selectedModel
      if (_selectedModel) {
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
      self.clearSelection()
    },
    navigate(fn) {
      const next = S.map(fn)(self.selectedModelOrCurrentDashboard)
      self.setSelectionToMaybeModel(next)
    },
    navigateNext() {
      self.navigate(getNextNode)
    },
    navigatePrev() {
      self.navigate(getPrevNode)
    },
    navigateLeft() {
      self.navigate(getLeftNode)
    },
    navigateRight() {
      self.navigate(getRightNode)
    },
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
    S.join,
    R.cond([
      [typeIs(Item), dotPath('parent.prevSibling')],
      [typeIs(Bucket), dotPath('prevSibling')],
      [typeIs(Dashboard), dotPath('lastChild')],
    ]),
  )(m)
}

function getRightNode(m) {
  return C(
    maybeOr(m.root),
    S.join,
    R.cond([
      [
        typeIs(Item),
        m =>
          C(
            toMaybe,
            S.map(p => p.childAtIdxOrLastOrSelf(m.index)),
            S.join,
            dotPath('parent.nextSibling'),
          )(m),
      ],
      [typeIs(Bucket), dotPath('nextSibling')],
      [typeIs(Dashboard), dotPath('firstChild')],
    ]),
  )(m)
}
