import {modelNamed} from '../../little-mst'
import {types} from 'mobx-state-tree'
import {setFocusAndSelectionOnDOMId} from '../../components/utils'
import * as R from 'ramda'
import {C, maybeOr_, maybeOrElse} from '../../little-ramda'
import S from 'sanctuary'
import {Bucket, Dashboard, Item} from './models'
import {getCurrentDashboard} from './helpers'

const modelTypes = [Item, Bucket, Dashboard]

function getParentDashboard(model) {
  return Dashboard.is(model)
    ? model
    : Bucket.is(model)
      ? model.dashboard
      : Item.is(model)
        ? model.bucket.dashboard
        : (() => {
            console.error('Invalid Model', model)
            throw new Error('Invalid Model')
          })()
}

function getFlatNavModels(model) {
  return getParentDashboard(model).flatNavIds
}

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedModel: types.maybeNull(
      types.union(...R.map(types.reference)(modelTypes)),
    ),
  })
  .views(self => ({
    get selectedModel() {
      return C(
        maybeOrElse(() => getCurrentDashboard(self)),
        S.toMaybe,
      )(self._selectedModel)
    },
  }))
  .actions(self => ({
    tapSelectedModel(fn) {
      return S.map(fn)(self.selectedModel)
    },
    navigateBy(getNewIdx, model) {
      const flatNavModels = getFlatNavModels(model)
      const idx = R.indexOf(model)(flatNavModels)
      const prevIdx = getNewIdx(idx, flatNavModels)

      self.setSelectionToModel(flatNavModels[prevIdx])
    },
    navigatePrev(model) {
      self.navigateBy(
        (idx, models) => (idx === 0 ? models.length - 1 : idx - 1),
        model,
      )
    },
    navigateNext(model) {
      self.navigateBy(
        (idx, models) => (idx === models.length - 1 ? 0 : idx + 1),
        model,
      )
    },
    maybeNavigateNext() {
      self.tapSelectedModel(self.navigateNext)
    },
    maybeNavigatePrev() {
      self.tapSelectedModel(self.navigatePrev)
    },
    setSelectionToModel(m) {
      self._selectedModel = m
      setFocusAndSelectionOnDOMId(m.id)
    },
    onDashboardMount(d) {
      R.compose(
        self.setSelectionToModel,
        maybeOr_(() => R.compose(R.last, R.take(3))(d.flatNavIds)),
      )(self.selectedModel)
    },
    onModelFocus(m) {
      self._selectedModel = m
    },
    onModelBlur() {
      self.clearSelection()
    },

    clearSelection() {
      self._selectedModel = null
    },

    onBeforeModelDelete(m) {
      self.tapSelectedModel(sm => {
        if (sm === m) {
          // self.maybeNavigateNext()
          self.clearSelection()
        }
      })
    },
  }))
