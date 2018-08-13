import store from './store'
import {wrapSP} from './lib/little-react'
import {compose} from './lib/ramda'

export const dispatch = actionName => (...args) => () =>
  store[actionName](...args)

const composeSP = (...fns) => compose(wrapSP, ...fns)

export const dispatchToggleDrawer = dispatch('toggleDrawer')
export const dispatchToggleDrawerSP = composeSP(dispatchToggleDrawer)
export const dispatchAddTask = dispatch('addTask')
export const dispatchAddTaskSP = composeSP(dispatchAddTask)
export const dispatchEditList = dispatch('editList')
export const dispatchEditListSP = composeSP(dispatchEditList)
