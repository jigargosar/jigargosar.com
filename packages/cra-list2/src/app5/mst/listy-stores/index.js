import rootStore from './root-store'
import {Root} from './collection-stores'

const store = rootStore

const root = Root.create()
const domain = root.domain

domain.addMockData()
export {domain, store}
