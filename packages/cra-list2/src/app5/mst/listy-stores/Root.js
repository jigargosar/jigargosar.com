import {applySnapshot2, modelNamed} from '../../little-mst'
import {getRoot, getSnapshot, types} from 'mobx-state-tree'
import {dotPath, isNotNil} from '../../little-ramda'
import * as R from 'ramda'
import {
  Domain,
  EditManager,
  SelectionManager,
} from './collection-stores'

export const Root = modelNamed('Root')
  .props({
    domain: types.optional(Domain, {}),
    selectionManager: types.optional(SelectionManager, {}),
    editManager: types.optional(EditManager, {}),
  })
  .actions(self => ({
    addMockData() {
      self.domain
        .addDashboard()
        .addBucket()
        .addItem()
    },
    initModule(module) {
      if (module.hot) {
        window.r = self
        const snapKey = Root.name
        const snap = dotPath(`hot.data.${snapKey}`)(module)
        R.ifElse(isNotNil)(applySnapshot2(self))(self.addMockData)(
          snap,
        )

        module.hot.dispose(
          data => (data[snapKey] = getSnapshot(self)),
        )
      }
    },
  }))

export function getSelectionManager(self) {
  return getRoot(self).selectionManager
}

export function getDomain(self) {
  return getRoot(self).domain
}

export function getEditManager(self) {
  return getRoot(self).editManager
}

export function onModelFocus(m) {
  return () => getRoot(m).selectionManager.onModelFocus(m)
}

export function onModelBlur(m) {
  return () => getRoot(m).selectionManager.onModelBlur()
}
