import {Collection} from '../Collection'
import {modelNamed, optionalCollections} from '../../little-mst'
import S from 'sanctuary'
import {getDashboardCollection} from './helpers'
import {Bucket, Dashboard, Item} from './DatabaseModels'

const collectionProps = {
  items: Collection(Item),
  buckets: Collection(Bucket),
  dashboards: Collection(Dashboard),
}

export const Database = modelNamed('Database')
  .props(optionalCollections(collectionProps))
  .views(self => ({
    get currentDashboard() {
      return S.head(getDashboardCollection(self).list)
    },
  }))
