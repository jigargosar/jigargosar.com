import * as m from 'mobx'
import {_, R} from '../utils'
import * as mst from 'mobx-state-tree'
export {createTransformer, createViewModel} from 'mobx-utils'

m.configure({computedRequiresReaction: true})

export const oObject = m.observable.object
export const oObject3 = _.curryN(3, m.observable.object)
export const createOObj = ({
  props = {},
  decorators = {},
  options = {},
} = {}) => oObject(props, decorators, options)
export const extendObservable = m.extendObservable
export const oArray = m.observable.array
export const oMap = m.observable.map
export const mSet = m.set
export const mValues = m.values
export const mAutoRun = m.autorun
export const mReaction = m.reaction
export const mTrace = m.trace
export const mJS = m.toJS
export const mIntercept = m.intercept
export const mActionBound = m.action.bound
export const mAction = m.action
export const mComputed = m.computed
export const t = mst.types
export const tModel = mst.types.model
export const tMap = mst.types.map

export const extendActions = _.curry((createActions, observable) => {
  const actions = createActions(observable)
  return extendObservable(observable, actions, _.map(mAction))
})

export const extendComputed = _.curry(
  (createComputed, observable) => {
    const computed = createComputed(observable)
    return extendObservable(observable, computed, _.map(mComputed))
  },
)

export const defineDelegatePropertyGetter = R.curry(
  (propertyName, src, target) =>
    Object.defineProperty(target, propertyName, {
      get() {
        return src[propertyName]
      },
      enumerable: true,
    }),
)

if (module.hot && !module.hot.data) {
  Object.assign(window, require('mobx'))
  Object.assign(window, require('mobx-utils'))
  window.devtoolsFormatters = window.devtoolsFormatters || []

  const listStyle = {
    style:
      'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal',
  }
  const mobxNameStyle = {style: 'color: rgb(232,98,0)'}
  const nullStyle = {style: 'color: #777'}

  const renderIterableHeader = (iterable, name = 'Iterable') => [
    'span',
    ['span', mobxNameStyle, name],
    ['span', `[${iterable.length}]`],
  ]

  const reference = (object, config) => {
    if (typeof object === 'undefined') {
      return ['span', nullStyle, 'undefined']
    } else if (object === 'null') {
      return ['span', nullStyle, 'null']
    }

    return ['object', {object, config}]
  }

  const hasBody = (collection, config) =>
    collection.length > 0 && !(config && config.noPreview)

  const renderIterableBody = (collection, mapper, options = {}) => {
    const children = Object.entries(m.toJS(collection)).map(mapper)
    return ['ol', listStyle, ...children]
  }

  window.devtoolsFormatters.push({
    header(o) {
      if (!m.isObservableObject(o)) {
        return null
      }
      return renderIterableHeader(Object.keys(o), 'Object')
    },
    hasBody: o => hasBody(Object.keys(o)),
    body(o) {
      return renderIterableBody(o, ([key, value]) => [
        'li',
        {},
        reference(key),
        ': ',
        reference(value),
      ])
    },
  })

  //   window.devtoolsFormatters = [{
  //     header: function(obj){
  //         return ["div", {}, obj.toString()]
  //     },
  //     hasBody: function(){
  //         return false;
  //     }
  // }]
}
