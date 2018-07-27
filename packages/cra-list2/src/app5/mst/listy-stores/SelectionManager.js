import {modelNamed} from '../../little-mst'
import {types} from 'mobx-state-tree'
import {setFocusAndSelectionOnDOMId} from '../../components/utils'
import * as R from 'ramda'
import S from 'sanctuary'
import {Bucket, Dashboard, Item} from './models'
import {getCurrentDashboard} from './helpers'
import {maybeOr_, maybeOrElse, sChain} from '../../little-sanctuary'
import {C} from '../../little-ramda'

const modelTypes = [Item, Bucket, Dashboard]

function getParentDashboard(model) {
  return Dashboard.is(model)
    ? model
    : Bucket.is(model)
      ? model.parent
      : Item.is(model)
        ? model.parent.parent
        : (() => {
            console.error('Invalid Model', model)
            throw new Error('Invalid Model')
          })()
}

function getFlatNavModels(model) {
  return getParentDashboard(model).flattenedTree
}

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
    navigateBy: R.curry((getNewIdx, model) => {
      const flattenedTree = getFlatNavModels(model)
      const idx = R.indexOf(model)(flattenedTree)
      const newIdx = getNewIdx(idx, flattenedTree)

      self.setSelectionToModel(flattenedTree[newIdx])
    }),
    navigateNext() {
      function nextSiblingOrThatOfFirstAncestor(m) {
        return C(
          maybeOrElse(() =>
            sChain(nextSiblingOrThatOfFirstAncestor)(m.maybeParent),
          ),
        )(m.nextSibling)
      }

      const next = S.map(m =>
        C(
          maybeOr_(() => m.root),
          maybeOrElse(() => nextSiblingOrThatOfFirstAncestor(m)),
        )(m.firstChild),
      )(self.selectedModelOrCurrentDashboard)

      self.setSelectionToMaybeModel(next)
    },
    navigatePrev() {
      function lastLeafOrSelf(m) {
        return C(maybeOr_(() => m), S.map(lastLeafOrSelf), S.last)(
          m.children,
        )
      }

      const prev = S.map(m =>
        C(
          maybeOr_(() => lastLeafOrSelf(m.root)),
          maybeOrElse(() => m.maybeParent),
          S.map(lastLeafOrSelf),
        )(m.prevSibling),
      )(self.selectedModelOrCurrentDashboard)

      self.setSelectionToMaybeModel(prev)

      // S.map(self.navigateBy(getPrevIndex))(
      //   self.selectedModelOrCurrentDashboard,
      // )
    },
  }))

// function getPrevIndex(idx, models) {
//   return idx === 0 ? models.length - 1 : idx - 1
// }
