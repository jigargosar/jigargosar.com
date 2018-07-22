import rootStore from './root-store'
import {Domain} from './collection-stores'
import {onAction, onPatch, onSnapshot} from 'mobx-state-tree'

const store = rootStore

const domain = Domain.create()

// export const domainPatches = []
// onPatch(domain, patch => {
//   domainPatches.push(patch)
//   console.log(`patches`, ...domainPatches)
// })

function loggerCallBack(message) {
  return (...a) => console.debug(message, ...a)
}

onSnapshot(domain, loggerCallBack(`onSnapshot`))
onPatch(domain, loggerCallBack(`onPatch`))
onAction(domain, loggerCallBack(`onAction`))

domain.addMockData()
export {domain, store}
