import rootStore from './root-store'
import {Domain} from './collection-stores'
import {mAutoRun} from '../../mobx/little-mobx'
import {getSnapshot} from 'mobx-state-tree'

const store = rootStore

const domain = Domain.create()

domain.addMockData()

export {domain, store}

mAutoRun(
  () => {
    console.log(`getSnapshot(domain)`, getSnapshot(domain))
  },
  {name: 'domain snapshots'},
)
