import {modelNamed} from '../../little-mst'
import {getRelativePath, tryResolve, types} from 'mobx-state-tree'
import {setFocusAndSelectionOnDOMId} from '../../components/utils'
import * as R from 'ramda'
import {C, maybeOr_} from '../../little-ramda'
import S from 'sanctuary'
import {getIDTypeOfModel} from '../CollectionModel'
import {Bucket, Dashboard, Item} from './models'

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
    _selectedModelPath: types.maybeNull(types.string),
  })
  .actions(self => ({
    getSelectedModel() {
      return C(S.map(path => tryResolve(self, path)), S.toMaybe)(
        self._selectedModelPath,
      )
    },
    tapSelectedModel(fn) {
      return S.map(fn)(self.getSelectedModel())
    },
    navigatePrev(model) {
      const flatNavIds = getFlatNavIds(model)
      const idx = R.indexOf(model.id)(flatNavIds)
      const prevIdx = idx === 0 ? flatNavIds.length - 1 : idx - 1

      self.setSelectionToModelId(flatNavIds[prevIdx])
    },

    navigateNext(model) {
      const flatNavIds = getFlatNavIds(model)
      const idx = R.indexOf(model.id)(flatNavIds)
      const nextIdx = idx === flatNavIds.length - 1 ? 0 : idx + 1

      self.setSelectionToModelId(flatNavIds[nextIdx])
    },
    maybeNavigateNext() {
      self.tapSelectedModel(self.navigateNext)
    },
    maybeNavigatePrev() {
      self.tapSelectedModel(self.navigatePrev)
    },

    setSelectionToModel(model) {
      self._selectedModelPath = getRelativePath(self, model)
      self.setSelectionToModelId(model.id)
    },
    setSelectionToModelId(id) {
      self._selectedModelId = id
      setFocusAndSelectionOnDOMId(id)
    },
    onDashboardMount(d) {
      R.compose(
        setFocusAndSelectionOnDOMId,
        maybeOr_(() => R.compose(R.last, R.take(3))(d.flatNavIds)),
        S.toMaybe,
      )(self._selectedModelId)
    },
    onModelFocus(m) {
      self._selectedModelId = m.id
      self._selectedModelPath = getRelativePath(self, m)
    },
    onModelBlur() {
      self.clearSelection()
    },

    clearSelection() {
      self._selectedModelId = null
      self._selectedModelPath = null
    },

    onBeforeModelDelete(m) {
      self.tapSelectedModel(sm => {
        if (sm === m) {
          self.clearSelection()
        }
      })
    },
  }))
