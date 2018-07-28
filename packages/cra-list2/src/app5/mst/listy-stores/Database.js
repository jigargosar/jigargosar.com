import {modelNamed, optionalObj} from '../../little-mst'
import {
  Bucket,
  BucketsCollection,
  Dashboard,
  DashboardsCollection,
  Item,
  ItemsCollection,
} from './models'
import {_cond, C, EQ, M, P, R} from '../../little-ramda'

const tables = [
  ItemsCollection,
  BucketsCollection,
  DashboardsCollection,
]

const collectionToOptionalType = M(C(optionalObj, P('type')))

const databaseProps = R.zipObj(R.pluck('tableName')(tables))(
  collectionToOptionalType(tables),
)
export const Database = modelNamed('Database')
  .props(databaseProps)
  .views(self => ({
    getCollection: _cond([
      [EQ(Item), () => self.items],
      [EQ(Bucket), () => self.buckets],
      [EQ(Dashboard), () => self.dashboards],
    ]),
  }))
