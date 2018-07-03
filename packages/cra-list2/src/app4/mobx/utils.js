/*eslint-disable*/

import * as m from 'mobx'
import {_, R} from '../utils'
import * as mst from 'mobx-state-tree'
import {
  ArrayFormatter,
  MapFormatter,
  ObjectFormatter,
} from './utils/formatters'

/*eslint-enable, eslint-disable no-empty-pattern*/

export {createTransformer, createViewModel} from 'mobx-utils'

m.configure({computedRequiresReaction: true, enforceActions: true})

export const oObject = m.observable.object
export const oObject3 = _.curryN(3, m.observable.object)
export const extendObservable = m.extendObservable
export const extendObservable2 = _.curryN(2, m.extendObservable)
export const extendObservable3 = _.curryN(3, m.extendObservable)
export const oArray = m.observable.array
export const oMap = m.observable.map
export const mSet = m.set
export const mGet = m.get
export const mValues = m.values
export const mAutoRun = m.autorun
export const mReaction = m.reaction
export const mWhen = m.when
export const mFlow = m.flow

export const mRunInAction = m.runInAction
export const mTrace = m.trace
export const mJS = m.toJS
export const mSpy = m.spy
export const mIntercept = m.intercept
export const mActionBound = m.action.bound
export const mAction = m.action
export const mComputed = m.computed
export const mIsObservable = m.isObservable
export const t = mst.types
export const tModel = mst.types.model
export const tMap = mst.types.map

function extendObservableWithBoundActions(obs, actions) {
  return extendObservable(
    obs,
    actions,
    _.map(_.always(mActionBound), actions),
  )
}

export function createObservableObject({
  props = {},
  actions = {},
  name,
} = {}) {
  const oObj = oObject(props, {}, {name})
  return extendObservableWithBoundActions(oObj, actions)
}

export const defineDelegatePropertyGetter = R.curry(
  (propertyName, src, target) =>
    Object.defineProperty(target, propertyName, {
      get() {
        return src[propertyName]
      },
      enumerable: true,
    }),
)

if (module.hot) {
  const window = global.window

  Object.assign(window, require('mobx'))
  Object.assign(window, require('mobx-utils'))

  window.devtoolsFormatters = window.devtoolsFormatters || []

  const formatters = [MapFormatter, ObjectFormatter, ArrayFormatter]

  const hotFormatters = _.pathOr(
    [],
    'hot.data.devtoolsFormatters'.split('.'),
  )(module)

  window.devtoolsFormatters.unshift(
    ...formatters,
    ..._.without(hotFormatters, window.devtoolsFormatters),
  )

  module.hot.dispose(data => {
    data.devtoolsFormatters = formatters
  })
}
