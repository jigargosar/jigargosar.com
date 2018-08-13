import store from './store'
import {wrapSP} from './lib/little-react'
import {compose} from './lib/ramda'

export const dispatch = actionName => (...args) => () =>
  store[actionName](...args)

export const dispatchToggleDrawer = dispatch('toggleDrawer')
export const dispatchToggleDrawerSP = compose(wrapSP, dispatchToggleDrawer)
export const dispatchAddTask = dispatch('addTask')
export const dispatchAddTaskSP = compose(wrapSP, dispatchAddTask)
export const dispatchEditList = dispatch('editList')
export const dispatchEditListSP = compose(wrapSP, dispatchEditList)
