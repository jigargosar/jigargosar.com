import {modelNamed} from '../../little-mst'
import {types} from 'mobx-state-tree'

export const EditManager = modelNamed('EditManager')
  .props({
    _editId: types.maybeNull(types.string),
  })
  .views(self => ({
    isEditing(ref) {
      return self._editId === ref.id
    },
  }))
  .actions(self => ({
    startEditing(model) {
      self._editId = model.id
    },
    endEditing(ref) {
      if (self.isEditing(ref)) {
        self._editId = null
      }
    },
  }))
