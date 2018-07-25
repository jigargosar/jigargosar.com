import {getSelectionManager} from './helpers'

export function onModelFocus(m) {
  return () => getSelectionManager(m).onModelFocus(m)
}

export function onModelBlur(m) {
  return () => getSelectionManager(m).onModelBlur()
}
