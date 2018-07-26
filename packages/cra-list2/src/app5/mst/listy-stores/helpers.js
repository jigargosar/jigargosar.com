import {getRoot} from 'mobx-state-tree'

export function getSelectionManager(self) {
  return getRoot(self).selectionManager
}

export function getEditManager(self) {
  return getRoot(self).editManager
}

export function setSelectionToModel(self) {
  getSelectionManager(self).setSelectionToModel(self)
}

export function startEditing(self) {
  getEditManager(self).startEditing(self)
}

export function endEditing(self) {
  getEditManager(self).endEditing(self)
}

export function isEditing(self) {
  return getEditManager(self).isEditing(self)
}

export function getItemCollection(self) {
  return getRoot(self).items
}

export function getDashboardCollection(self) {
  return getRoot(self).dashboards
}

export function getBucketCollection(self) {
  return getRoot(self).buckets
}

export function onDelete(self) {
  getRoot(self).onModelDelete(self)
}

export function getCurrentDashboard(self) {
  return getRoot(self).currentDashboard
}
