import {
  applySnapshot2,
  modelNamed,
  optionalCollections,
} from '../../little-mst'
import {
  addDisposer,
  addMiddleware,
  getEnv,
  getSnapshot,
  types,
} from 'mobx-state-tree'
import {dotPath, isNotNil} from '../../little-ramda'
import * as R from 'ramda'
import {SelectionManager} from './SelectionManager'
import {EditManager} from './EditManager'
import {actionLogger} from 'mst-middlewares'
import {getDashboardCollection, getSelectionManager} from './helpers'
import S from 'sanctuary'
import {Collection} from '../Collection'
import {Bucket, Dashboard, Item} from './models'
import {whenKeyPD, withKeyEvent} from '../../components/utils'

const collectionProps = {
  items: Collection(Item),
  buckets: Collection(Bucket),
  dashboards: Collection(Dashboard),
}

export const Root = modelNamed('Root')
  .props({
    ...optionalCollections(collectionProps),
    selectionManager: types.optional(SelectionManager, {}),
    editManager: types.optional(EditManager, {}),
  })
  .views(self => ({
    get currentDashboard() {
      return S.head(getDashboardCollection(self).list)
    },
    get onGlobalKeyDown() {
      return withKeyEvent(
        whenKeyPD('up')(() =>
          getSelectionManager(self).navigatePrev(),
        ),
        whenKeyPD('down')(() =>
          getSelectionManager(self).navigateNext(),
        ),
        whenKeyPD('d')(() =>
          getSelectionManager(self).deleteSelectionTree(),
        ),
      )
    },
  }))
  .actions(self => ({
    onModelDelete(m) {},
  }))
  .actions(self => ({
    afterCreate() {
      addDisposer(self, addMiddleware(self, actionLogger))
      // addDisposer(self, addMiddleware(self, actionLogger))
      self.initModule()
    },
    addMockData() {
      getDashboardCollection(self)
        .add()
        .addBucket()
        .addItem()
    },
    initModule() {
      const module = getEnv(self).module
      if (module && module.hot) {
        window.r = self
        const snapKey = Root.name
        const snap = dotPath(`hot.data.${snapKey}`)(module)
        R.ifElse(isNotNil)(applySnapshot2(self))(self.addMockData)(
          snap,
        )

        module.hot.dispose(
          data => (data[snapKey] = getSnapshot(self)),
        )
      } else {
        self.addMockData()
      }
    },
  }))
