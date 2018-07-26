import {modelNamed} from '../../little-mst'
import {types} from 'mobx-state-tree'
import {setFocusAndSelectionOnDOMId} from '../../components/utils'
import * as R from 'ramda'
import {C, maybeOr_, maybeOrElse} from '../../little-ramda'
import S from 'sanctuary'
import {getIDTypeOfModel} from '../CollectionModel'
import {Bucket, Dashboard, Item} from './models'
import {getCurrentDashboard} from './helpers'

const models = [Item, Bucket, Dashboard]
const modelIDTypes = R.map(getIDTypeOfModel)(models)
const modelIDUnionType = types.union({}, ...modelIDTypes)

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

function getFlatNavIds(model) {
  return getParentDashboard(model).flatNavIds
}

export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedModelId: types.maybeNull(modelIDUnionType),
    _selectedModel: types.maybeNull(
      types.union(...R.map(types.reference)(models)),
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
    navigatePrev(model) {
      const flatNavIds = getFlatNavIds(model)
      const idx = R.indexOf(model)(flatNavIds)
      const prevIdx = idx === 0 ? flatNavIds.length - 1 : idx - 1

      self.setSelectionToModel(flatNavIds[prevIdx])
    },

    navigateNext(model) {
      const flatNavIds = getFlatNavIds(model)
      const idx = R.indexOf(model)(flatNavIds)
      const nextIdx = idx === flatNavIds.length - 1 ? 0 : idx + 1

      self.setSelectionToModel(flatNavIds[nextIdx])
    },
    maybeNavigateNext() {
      self.tapSelectedModel(self.navigateNext)
    },
    maybeNavigatePrev() {
      self.tapSelectedModel(self.navigatePrev)
    },

    setSelectionToModel(m) {
      self._selectedModel = m
      self.setSelectionToModelId(m.id)
    },
    setSelectionToModelId(id) {
      self._selectedModelId = id
      setFocusAndSelectionOnDOMId(id)
    },
    onDashboardMount(d) {
      R.compose(
        self.setSelectionToModel,
        maybeOr_(() => R.compose(R.last, R.take(3))(d.flatNavIds)),
        S.toMaybe,
      )(self._selectedModelId)
    },
    onModelFocus(m) {
      self._selectedModelId = m.id
      self._selectedModel = m
    },
    onModelBlur() {
      self.clearSelection()
    },

    clearSelection() {
      self._selectedModelId = null
      self._selectedModel = null
    },

    onBeforeModelDelete(m) {
      self.tapSelectedModel(sm => {
        if (sm === m) {
          self.clearSelection()
        }
      })
    },
  }))
