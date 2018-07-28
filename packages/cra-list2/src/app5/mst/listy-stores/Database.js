import {modelNamed, optionalObj} from '../../little-mst'
import * as R from 'ramda'
import {
  Bucket,
  Buckets,
  Dashboard,
  Dashboards,
  Item,
  Items,
} from './models'

const collectionProps = {
  items: Items,
  buckets: Buckets,
  dashboards: Dashboards,
}

export const Database = modelNamed('Database')
  .props(R.map(optionalObj)(collectionProps))
  .views(self => ({
    getCollection: R.cond([
      [R.equals(Item), () => self.items],
      [R.equals(Bucket), () => self.buckets],
      [R.equals(Dashboard), () => self.dashboards],
    ]),
  }))
