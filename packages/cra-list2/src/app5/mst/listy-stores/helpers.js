import {getRoot} from 'mobx-state-tree'

export function getSelectionManager(self) {
  return getRoot(self).selectionManager
}

export function getEditManager(self) {
  return getRoot(self).selectionManager
}

export function setSelectionToModel(self) {
  getSelectionManager(self).setSelectionToModel(self)
}

export function isEditingModel(self) {
  return getEditManager(self).isEditingModel(self)
}

function getDatabase(self) {
  return getRoot(self).database
}

export function getCollectionOfModelType(self, modelType) {
  return getDatabase(self).getCollection(modelType)
}

export function getCollectionInstance(self, collection) {
  return getDatabase(self)[collection.tableName]
}

export function getCurrentDashboard(self) {
  return getRoot(self).currentDashboard
}
