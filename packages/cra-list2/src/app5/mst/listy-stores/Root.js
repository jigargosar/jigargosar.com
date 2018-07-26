import {applySnapshot2, modelNamed} from '../../little-mst'
import {
  addDisposer,
  addMiddleware,
  getSnapshot,
  types,
} from 'mobx-state-tree'
import {dotPath, isNotNil} from '../../little-ramda'
import * as R from 'ramda'
import {Database} from './Database'
import {SelectionManager} from './SelectionManager'
import {EditManager} from './EditManager'
import {actionLogger} from 'mst-middlewares'
import {getDashboardCollection} from './helpers'
import S from 'sanctuary'

export const Root = modelNamed('Root')
  .props({
    domain: types.optional(Database, {}),
    selectionManager: types.optional(SelectionManager, {}),
    editManager: types.optional(EditManager, {}),
  })
  .views(self => ({
    get currentDashboard() {
      return S.head(getDashboardCollection(self).list)
    },
  }))
  .actions(self => ({
    afterCreate() {
      // addDisposer(self, addMiddleware(self, simpleActionLogger))
      addDisposer(self, addMiddleware(self, actionLogger))
    },
    addDashboard(snap) {
      return getDashboardCollection(self).add(snap)
    },
    addMockData() {
      self
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
