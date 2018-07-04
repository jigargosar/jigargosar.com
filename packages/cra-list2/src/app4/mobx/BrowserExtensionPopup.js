import {createObservableObject} from './utils'
import {getParsedQS} from '../services/Location'
import {_} from '../utils'

const hasUrl = _.has('url')
export function BrowserExtensionPopup() {
  return createObservableObject({
    props: {
      get isRunningAsBrowserPopup() {
        return hasUrl(getParsedQS())
      },
    },
    actions: {},
    name: 'BrowserExtensionPopup',
  })
}
