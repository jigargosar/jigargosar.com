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

export function navigatePrev(self) {
  getSelectionManager(self).navigatePrev(self)
}

export function navigateNext(self) {
  getSelectionManager(self).navigateNext(self)
}
