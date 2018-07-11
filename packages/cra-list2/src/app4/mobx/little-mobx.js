/*eslint-disable*/

import * as m from 'mobx'
import {_, RA} from '../little-ramda'
import * as mst from 'mobx-state-tree'
import {
  ArrayFormatter,
  MapFormatter,
  ObjectFormatter,
} from './utils/formatters'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export {createTransformer, createViewModel} from 'mobx-utils'

m.configure({computedRequiresReaction: true, enforceActions: true})

export const oObject = m.observable.object
export const oRef = m.observable.ref
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
export const mJSRejectFn = _.compose(_.reject(RA.isFunction), m.toJS)
export const mSpy = m.spy
export const mIntercept = m.intercept
export const mObserve = m.observe
export const mActionBound = m.action.bound
export const mAction = m.action
export const mComputed = m.computed
export const mIsObservable = m.isObservable
export const t = mst.types
export const tModel = mst.types.model
export const tMap = mst.types.map

const extendObservableWithBoundActions = _.curry(
  function extendObservableWithBoundActions(actions, obs) {
    return extendObservable(
      obs,
      actions,
      _.map(_.always(mActionBound), actions),
    )
  },
)

const extendObservableWithComputed = _.curry(
  function extendObservableWithComputed(computed, obs) {
    return extendObservable(
      obs,
      computed,
      _.map(_.always(mComputed), computed),
    )
  },
)

export function createObservableObject({
  observableObject = {},
  props = {},
  actions = {},
  computed = {},
  name,
} = {}) {
  const oObj = extendObservable(observableObject, props, {}, {name})
  return _.compose(
    extendObservableWithBoundActions(actions),
    extendObservableWithComputed(computed),
  )(oObj)
}

export function extendObservableObject(
  obs,
  {props = {}, actions = {}, name} = {},
) {
  const oObj = extendObservable(obs, props, {}, {name})
  return extendObservableWithBoundActions(actions, oObj)
}

export const defineDelegatePropertyGetter = _.curry(
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

export function Disposers() {
  const list = []
  return {
    push: (...args) => list.push(...args),
    dispose: () => {
      list.forEach(_.call)
      list.splice(0, list.length)
    },
    length: () => list.length,
  }
}

export function attachDelegatingPropertyGetters(
  note,
  displayNote,
  propertyNames,
) {
  _.forEach(
    defineDelegatePropertyGetter(_.__, note, displayNote),
    propertyNames,
  )
}
