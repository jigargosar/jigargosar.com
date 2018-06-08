import {observable, toJS} from 'mobx'

export const rootStore = observable({
  pageTitle: 'CRA List Prototype',
  counter: 0,
})

if (module.hot) {
  if (module.hot.data && module.hot.data.store) {
    // applySnapshot(store, module.hot.data.store)
    Object.asssign(rootStore, module.hot.data.store)
  }
  module.hot.dispose(data => {
    // data.store = getSnapshot(store)
    data.store = toJS(rootStore)
  })
}
