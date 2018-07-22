import rootStore from './root-store'
import {Domain} from './collection-stores'
import {onAction, onPatch, onSnapshot} from 'mobx-state-tree'
import {mRunInAction} from '../../mobx/little-mobx'

const store = rootStore

const domain = Domain.create()

onSnapshot(domain, function(...a) {
  console.log(`onSnapshot`, a)
})

onPatch(domain, function(...a) {
  console.log(`onPatch`, a)
})

onAction(domain, function(...a) {
  console.log(`onAction`, a)
})

setTimeout(() => {
  mRunInAction(() => {
    domain.addMockData()
  })
}, 10)
export {domain, store}
