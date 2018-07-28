import {
  applySnapshot2,
  modelNamed,
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
import {actionLogger} from 'mst-middlewares'
import {getCollectionInstance, getSelectionManager} from './helpers'
import S from 'sanctuary'
import {DashboardsCollection} from './models'
import {Database} from './Database'

export const Root = modelNamed('Root')
  .props({
    database: optionalObj(Database),
    selectionManager: optionalObj(SelectionManager),
  })
  .views(self => ({
    get currentDashboard() {
      return S.head(
        getCollectionInstance(self, DashboardsCollection).list,
      )
    },
    get onGlobalKeyDown() {
      return getSelectionManager(self).onKeyDown
    },
  }))
  .actions(self => ({
    afterCreate() {
      addDisposer(self, addMiddleware(self, actionLogger))
      setImmediate(self.initModule)
      // self.initModule()
    },
    addMockData() {
      getCollectionInstance(self, DashboardsCollection)
        .add()
        .addChild({})
        .addChild({})
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
