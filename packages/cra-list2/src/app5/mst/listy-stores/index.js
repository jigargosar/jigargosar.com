import rootStore from './root-store'
import {Domain} from './collection-stores'

const store = rootStore

const domain = Domain.create()

domain.addMockData()

export {domain, store}
