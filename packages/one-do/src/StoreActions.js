import store from './store'
import {tapSP} from './lib/little-react'

export const dispatch = actionName => (...args) => () =>
  store[actionName](...args)

export const dispatchSP = actionName => (...args) =>
  tapSP(() => store[actionName](...args))

export const dispatchToggleDrawer = dispatch('toggleDrawer')
export const dispatchToggleDrawerSP = dispatchSP('toggleDrawer')

export const dispatchAddList = dispatch('addList')
export const dispatchAddListSP = dispatchSP('addList')
export const dispatchEditList = dispatch('editList')
export const dispatchEditListSP = dispatchSP('editList')
export const dispatchUpdateList = dispatch('updateList')
export const dispatchUpdateListSP = dispatchSP('updateList')
export const dispatchDeleteList = dispatch('deleteList')
export const dispatchDeleteListSP = dispatchSP('deleteList')

export const dispatchAddTask = dispatch('addTask')
export const dispatchAddTaskSP = dispatchSP('addTask')
export const dispatchEditTask = dispatch('editTask')
export const dispatchEditTaskSP = dispatchSP('editTask')
export const dispatchUpdateTask = dispatch('updateTask')
export const dispatchUpdateTaskSP = dispatchSP('updateTask')
export const dispatchDeleteTask = dispatch('deleteTask')
export const dispatchDeleteTaskSP = dispatchSP('deleteTask')
