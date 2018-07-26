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
    addDashboard: model => self.dashboards.add(model),
    deleteBucket(b) {
      self.items.deleteAll(b.items)
      self.buckets.delete(b)
    },
    deleteItem: i => self.items.delete(i),
  }))
