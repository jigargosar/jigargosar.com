import {Model} from '../Model'
import {getParentOfType, getType, types} from 'mobx-state-tree'
import {Collection} from '../Collection'
import {optionalCollections} from '../../little-mst'

function getDomain(self) {
  return getType(self) === Domain
    ? self
    : getParentOfType(self, Domain)
}
function getItemCollection(self) {
  return getDomain(self).itemCollection
}

function getDashboardCollection(self) {
  return getDomain(self).dashboards
}

const Dashboard = Model({
  name: 'Dashboard',
}).extend(self => {
  const queryName = `buckets`
  const tableName = `buckets`
  const hasManyModelName = `Bucket`
  const identifiedBy = 'dashboard'
  return {
    views: {
      get [queryName]() {
        return getDomain(self)[tableName].whereEq({
          [identifiedBy]: self,
        })
      },
    },
    actions: {
      [`add${hasManyModelName}`](model) {
        return getDomain(self)[tableName].add({
          ...model,
          [identifiedBy]: self,
        })
      },
    },
  }
})

const Bucket = Model({
  name: 'Bucket',
  attrs: {dashboard: types.reference(Dashboard)},
})
  .views(self => ({
    get items() {
      return getItemCollection(self).whereEq({bucket: self})
    },
  }))
  .actions(self => ({
    addItem(model) {
      return getItemCollection(self).add({
        ...model,
        bucket: self,
      })
    },
  }))

const Item = Model({
  name: 'Item',
  attrs: {bucket: types.reference(Bucket)},
})

// function hasMany(Model, ManyModel) {
//   return {
//     manyPropName: R.compose(pluralize, R.toLower)(ManyModel.name),
//     addManyModelFnName: `add${ManyModel.name}`,
//     identifiedBy: R.toLower(Model.name),
//   }
// }
// console.log(`hasMany(Dashboard, Bucket)`, hasMany(Dashboard, Bucket))
//

const collectionProps = {
  itemCollection: Collection(Item),
  buckets: Collection(Bucket),
  dashboards: Collection(Dashboard),
}

export const Domain = types
  .model('Domain')
  .props(optionalCollections(collectionProps))
  .views(domainViews)
  .actions(domainActions)

function domainViews(self) {
  return {}
}

function domainActions(self) {
  return {
    addDashboard(model) {
      return getDashboardCollection(self).add(model)
    },
  }
}
