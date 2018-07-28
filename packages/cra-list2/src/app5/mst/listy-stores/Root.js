import {
  applySnapshot2,
  modelNamed,
  optionalCollections,
  optionalObj,
} from '../../little-mst'
import {
  addDisposer,
  addMiddleware,
  getEnv,
  getSnapshot,
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

const Database = modelNamed('Database').props(
  optionalCollections(collectionProps),
)

export const Root = modelNamed('Root')
  .props({
    database: optionalObj(Database),
    ...optionalCollections(collectionProps),
    selectionManager: optionalObj(SelectionManager),
    editManager: optionalObj(EditManager),
  })
  .views(self => ({
    get currentDashboard() {
      return S.head(getDashboardCollection(self).list)
    },
    get onGlobalKeyDown() {
      const sm = getSelectionManager(self)
      return withKeyEvent(
        whenKeyPD('up')(sm.onNavigatePrev),
        whenKeyPD('down')(sm.onNavigateNext),
        whenKeyPD('left')(sm.onNavigateLeft),
        whenKeyPD('right')(sm.onNavigateRight),
        whenKeyPD('d')(sm.deleteSelectionTree),
      )
    },
  }))
  .actions(self => ({
    afterCreate() {
      addDisposer(self, addMiddleware(self, actionLogger))
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
