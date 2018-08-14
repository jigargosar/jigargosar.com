import store from './store'
import {tapSP} from './lib/little-react'
import {toggleIsDrawerOpen} from './RootStore'

export const handle = actionName => (...args) => () =>
  store[actionName](...args)

export const handleSP = actionName => (...args) =>
  tapSP(() => store[actionName](...args))

export const handleAddList = handle('addList')
export const handleAddListSP = handleSP('addList')
export const handleEditList = handle('editList')
export const handleEditListSP = handleSP('editList')

export const handleAddTask = handle('addTask')
export const handleAddTaskSP = handleSP('addTask')
export const handleEditTask = handle('editTask')
export const handleEditTaskSP = handleSP('editTask')

export const handleUpdateItem = handle('updateItem')
export const handleUpdateItemSP = handleSP('updateItem')
export const handleDeleteItem = handle('deleteItem')
export const handleDeleteItemSP = handleSP('deleteItem')

export const handleSetSelection = handle('setSelection')
export const handleSetSelectionSP = handleSP('setSelection')
export const handleToggleDrawer = val => e => toggleIsDrawerOpen(val)
