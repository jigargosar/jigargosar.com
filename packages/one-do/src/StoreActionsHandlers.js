import store from './store'
import {tapSP} from './lib/little-react'

export const handle = actionName => (...args) => () =>
  store[actionName](...args)

export const handleSP = actionName => (...args) =>
  tapSP(() => store[actionName](...args))

export const handleToggleDrawer = handle('toggleDrawer')
export const handleToggleDrawerSP = handleSP('toggleDrawer')

export const handleAddList = handle('addList')
export const handleAddListSP = handleSP('addList')
export const handleEditList = handle('editList')
export const handleEditListSP = handleSP('editList')
export const handleDeleteList = handle('deleteList')
export const handleDeleteListSP = handleSP('deleteList')

export const handleAddTask = handle('addTask')
export const handleAddTaskSP = handleSP('addTask')
export const handleEditTask = handle('editTask')
export const handleEditTaskSP = handleSP('editTask')
export const handleDeleteTask = handle('deleteTask')
export const handleDeleteTaskSP = handleSP('deleteTask')

export const handleUpdateItem = handle('updateItem')
export const handleUpdateItemSP = handleSP('updateItem')

export const handleSetSelection = handle('setSelection')
export const handleSetSelectionSP = handleSP('setSelection')
