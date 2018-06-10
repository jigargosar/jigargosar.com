import {addDisposer as mstAddDisposer} from 'mobx-state-tree'

export function addDisposer(target, disposer) {
  return mstAddDisposer(target, () => {
    try {
      disposer()
    } catch (e) {
      debugger
      console.error(e)
    }
  })
}

export function addSubscriptionDisposer(target, subscription) {
  return addDisposer(target, () => subscription.unsubscribe())
}
