import {modelNamed, optionalObj} from '../../little-mst'
import {addDisposer, addMiddleware} from 'mobx-state-tree'
import {SelectionManager} from './SelectionManager'
import {actionLogger} from 'mst-middlewares'
import {getCollectionInstance, getSelectionManager} from './helpers'
import S from 'sanctuary'
import {Dashboards} from './models'
import {Database} from './Database'

export const Root = modelNamed('Root')
  .props({
    database: optionalObj(Database),
    selectionManager: optionalObj(SelectionManager),
  })
  .views(self => ({
    get currentDashboard() {
      return S.head(getCollectionInstance(self, Dashboards).list)
    },
    get onGlobalKeyDown() {
      return getSelectionManager(self).onKeyDown
    },
  }))
  .actions(self => ({
    afterCreate() {
      addDisposer(self, addMiddleware(self, actionLogger))
    },
    addMockData() {
      getCollectionInstance(self, Dashboards)
        .add()
        .addChild({})
        .addChild({})
    },
  }))
