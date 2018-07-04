import {createObservableObject} from './utils'

export function BrowserExtensionPopup() {
  return createObservableObject({
    props: {
      isRunningAsBrowserPopup() {
        return true
      },
    },
    actions: {},
    name: 'BrowserExtensionPopup',
  })
}
