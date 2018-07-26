import {Collection} from '../Collection'
import {modelNamed, optionalCollections} from '../../little-mst'
import S from 'sanctuary'
import {getDashboardCollection} from './helpers'
import {Bucket, Dashboard, Item} from './DomainModels'

const collectionProps = {
  items: Collection(Item),
  buckets: Collection(Bucket),
  dashboards: Collection(Dashboard),
}

export const Domain = modelNamed('Domain')
  .props(optionalCollections(collectionProps))
  .views(self => ({
    get currentDashboard() {
      return S.head(getDashboardCollection(self).list)
    },
  }))
  .actions(self => ({
    addDashboard: snap => self.dashboards.add(snap),
    deleteBucket: m => self.buckets.delete(m),
    deleteItem: m => self.items.delete(m),
  }))
