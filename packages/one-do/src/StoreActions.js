import store from './store'

export const dispatch = actionName => (...args) => () =>
  store[actionName](...args)

export const dispatchToggleDrawer = dispatch('toggleDrawer')
export const dispatchAddTask = dispatch('addTask')
