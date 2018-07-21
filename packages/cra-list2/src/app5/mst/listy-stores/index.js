import rootStore from './root-store'
import {DashboardC, Domain} from './collection-stores'
import {getSnapshot} from 'mobx-state-tree'

export const store = rootStore

const domain = Domain.create()

domain
  .add({}, DashboardC)
  .addBucket()
  .addItem()
console.log(`domain`, domain)
console.log(`getSnapshot(domain)`, getSnapshot(domain))
