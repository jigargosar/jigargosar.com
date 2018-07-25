import {modelNamed} from '../../little-mst'
import {types} from 'mobx-state-tree'
import {setFocusAndSelectionOnDOMId} from '../../components/utils'
import * as R from 'ramda'
import {maybeOr_} from '../../little-ramda'
import S from 'sanctuary'
import {getIDTypeOfModel} from '../Model'
import {Bucket, Dashboard, Item} from './collection-stores'

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
    _selectedModelRef: types.maybeNull(
      types.union(...R.map(m => types.reference(m))(models)),
    ),
  })
  .views(self => ({
    get selectedModel() {
      return S.toMaybe(self._selectedModelRef)
    },
  }))
  .actions(self => ({
    // afterCreate() {
    //   addDisposer(self, onSnapshot(self, console.warn))
    // },
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
      S.map(self.navigateNext)(self.selectedModel)
    },
    maybeNavigatePrev() {
      S.map(self.navigatePrev)(self.selectedModel)
    },

    setSelectionToModel(model) {
      self._selectedModelRef = model
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
      self._selectedModelRef = m
    },
    onModelBlur() {
      self._selectedModelId = null
      self._selectedModelRef = null
    },
  }))
