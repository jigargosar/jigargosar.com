import {getRoot} from 'mobx-state-tree'

export function getSelectionManager(self) {
  return getRoot(self).selectionManager
}

export function getDomain(self) {
  return getRoot(self).domain
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
  return getDomain(self).items
}

export function getDashboardCollection(self) {
  return getDomain(self).dashboards
}

export function getBucketCollection(self) {
  return getDomain(self).buckets
}
