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
export const SelectionManager = modelNamed('SelectionManager')
  .props({
    _selectedModelId: types.maybeNull(modelIDUnionType),
  })
  .actions(self => ({
    setSelectionToModel(model) {
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
    },
    onModelBlur() {
      self._selectedModelId = null
    },
  }))
