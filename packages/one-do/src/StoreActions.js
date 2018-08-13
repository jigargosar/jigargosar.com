import store from './store'
import {tapSP} from './lib/little-react'
import {compose} from './lib/ramda'

export const dispatch = actionName => (...args) => () =>
  store[actionName](...args)

const composeSP = (...fns) => compose(tapSP, ...fns)

export const dispatchToggleDrawer = dispatch('toggleDrawer')
export const dispatchToggleDrawerSP = composeSP(dispatchToggleDrawer)

export const dispatchAddList = dispatch('addList')
export const dispatchAddListSP = composeSP(dispatchAddList)
export const dispatchEditList = dispatch('editList')
export const dispatchEditListSP = composeSP(dispatchEditList)
export const dispatchUpdateList = dispatch('updateList')
export const dispatchUpdateListSP = composeSP(dispatchUpdateList)
export const dispatchDeleteList = dispatch('deleteList')
export const dispatchDeleteListSP = composeSP(dispatchDeleteList)

export const dispatchAddTask = dispatch('addTask')
export const dispatchAddTaskSP = composeSP(dispatchAddTask)
export const dispatchEditTask = dispatch('editTask')
export const dispatchEditTaskSP = composeSP(dispatchEditTask)
export const dispatchUpdateTask = dispatch('updateTask')
export const dispatchUpdateTaskSP = composeSP(dispatchUpdateTask)
export const dispatchDeleteTask = dispatch('deleteTask')
export const dispatchDeleteTaskSP = composeSP(dispatchDeleteTask)
