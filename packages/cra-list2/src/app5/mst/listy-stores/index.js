import rootStore from './root-store'
import {mapSnapshot} from '../../little-mst'
import {BucketModel, DashboardModel, Items} from './collection-stores'

export const store = rootStore

const d = DashboardModel.create()
const b = BucketModel.create({dashboard: d})

Items.add({bucket: b})

const list = Items.list

console.log(`Items.list`, list, mapSnapshot(list))
