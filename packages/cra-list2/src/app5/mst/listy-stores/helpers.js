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

export function onModelFocus(m) {
  return () => getRoot(m).selectionManager.onModelFocus(m)
}

export function onModelBlur(m) {
  return () => getRoot(m).selectionManager.onModelBlur()
}
