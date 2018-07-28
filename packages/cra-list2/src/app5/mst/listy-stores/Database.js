import {modelNamed, optionalObj} from '../../little-mst'
import {
  Bucket,
  Buckets,
  Dashboard,
  Dashboards,
  Item,
  Items,
} from './models'
import {_cond, C, EQ, M, P, R} from '../../little-ramda'

const tables = [Items, Buckets, Dashboards]

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
