import {getSelectionManager} from './helpers'

export function onModelFocus(model) {
  return () => getSelectionManager(model).onModelFocus(model)
}

export function onModelBlur(model) {
  return () => getSelectionManager(model).onModelBlur()
}

export function restoreFocusOnSelectedModelOnDashboardMount(
  dashboard,
) {
  getSelectionManager(dashboard).onDashboardMount(dashboard)
}
