import {modelNamed, optionalObj} from '../../little-mst'
import * as R from 'ramda'
import {
  Bucket,
  BucketsCollection,
  Dashboard,
  DashboardsCollection,
  Item,
  ItemsCollection,
} from './models'
import {C} from '../../little-ramda'

const collectionProps = {
  items: ItemsCollection,
  buckets: BucketsCollection,
  dashboards: DashboardsCollection,
}

export const Database = modelNamed('Database')
  .props(R.map(C(optionalObj, R.prop('type')))(collectionProps))
  .views(self => ({
    getCollection: R.cond([
      [R.equals(Item), () => self.items],
      [R.equals(Bucket), () => self.buckets],
      [R.equals(Dashboard), () => self.dashboards],
    ]),
  }))
