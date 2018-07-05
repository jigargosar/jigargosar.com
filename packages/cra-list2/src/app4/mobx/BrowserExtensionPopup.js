import {createObservableObject, mWhen} from './utils'
import {getParsedQS} from '../services/Location'
import {_} from '../utils'
import escapeStringRegexp from 'escape-string-regexp'

const hasUrl = _.has('url')

export function BrowserExtensionPopup({nc}) {
  const pop = createObservableObject({
    props: {
      get note() {
        return nc.find(note =>
          _.compose(
            _.test(_.__, note.text),
            str => new RegExp(str),
            escapeStringRegexp,
          )(pop.url),
        )
      },
      get url() {
        return _.pathOr(null, 'url'.split('.'), getParsedQS())
      },
      get title() {
        return _.pathOr(null, 'title'.split('.'), getParsedQS())
      },
      get isRunningAsBrowserPopup() {
        return hasUrl(getParsedQS())
      },
    },
    actions: {
      ensureNote() {
        if (_.isNil(this.note)) {
          nc.addNew({text: `${this.title} -- ${this.url}`})
        }
      },
    },
    name: 'BrowserExtensionPopup',
  })
  mWhen(
    () => pop.isRunningAsBrowserPopup,
    () => {
      console.log(`pop.url`, pop.url)
      console.log(`note`, pop.note)
    },
    {
      name: 'onPopup',
    },
  )
  return pop
}
