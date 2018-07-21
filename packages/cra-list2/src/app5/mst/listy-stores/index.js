import rootStore from './root-store'
import {
  BucketCollection,
  DashboardCollection,
  Domain,
  ItemCollection,
} from './collection-stores'
import {getSnapshot} from 'mobx-state-tree'

export const store = rootStore

const domain = Domain.create()

const dashboard = domain.add({}, DashboardCollection)
const bucket = domain.add({dashboard}, BucketCollection)
domain.add({bucket}, ItemCollection)
console.log(`domain`, domain)
console.log(`getSnapshot(domain)`, getSnapshot(domain))
