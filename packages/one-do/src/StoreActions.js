import store from './store'

export const actionDispatcher = actionName => (...args) => () =>
  store[actionName](...args)
export const dispatchToggleDrawer = actionDispatcher('toggleDrawer')
