import {getRoot} from 'mobx-state-tree'

export function getSelectionManager(self) {
  return getRoot(self).selectionManager
}

export function startEditingModel(self) {
  getSelectionManager(self).startEditingModel(self)
}

export function isEditingModel(self) {
  return getSelectionManager(self).isEditingModel(self)
}

function getDatabase(self) {
  return getRoot(self).database
}

export function getCollectionInstance(self, collection) {
  return getDatabase(self)[collection.tableName]
}

export function getCurrentDashboard(self) {
  return getRoot(self).currentDashboard
}
