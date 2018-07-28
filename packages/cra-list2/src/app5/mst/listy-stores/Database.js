import {modelNamed, optionalObj} from '../../little-mst'
import * as R from 'ramda'
import {Bucket, Dashboard, Item} from './models'
import {Collection} from '../Collection'

const collectionProps = {
  items: Collection(Item),
  buckets: Collection(Bucket),
  dashboards: Collection(Dashboard),
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
