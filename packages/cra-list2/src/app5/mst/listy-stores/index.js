import rootStore from './root-store'
import {DashboardC, Domain} from './collection-stores'
import {getSnapshot} from 'mobx-state-tree'

export const store = rootStore

const domain = Domain.create()

const dashboard = domain.add({}, DashboardC)
dashboard.addBucket().addItem()
console.log(`domain`, domain)
console.log(`getSnapshot(domain)`, getSnapshot(domain))
