import rootStore from './root-store'
import {Domain} from './collection-stores'
import {onAction, onPatch, onSnapshot} from 'mobx-state-tree'
import {mRunInAction} from '../../mobx/little-mobx'

const store = rootStore

const domain = Domain.create()

const patches = []
onPatch(domain, patch => {
  patches.push(patch)
  console.log(`patches`, ...patches)
})

function loggerCallBack(message) {
  return (...a) => console.log(message, a)
}

// const snapshots

onSnapshot(domain, loggerCallBack(`onSnapshot`))

onPatch(domain, loggerCallBack(`onPatch`))

onAction(domain, loggerCallBack(`onAction`))

setTimeout(() => {
  mRunInAction(() => {
    domain.addMockData()
  })
}, 10)
export {domain, store}
