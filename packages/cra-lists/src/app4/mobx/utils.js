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
