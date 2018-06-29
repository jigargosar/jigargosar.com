import * as m from 'mobx'
import {_, R, RB, RX} from '../utils'
import * as mst from 'mobx-state-tree'
import {
  ArrayFormatter,
  MapFormatter,
  ObjectFormatter,
} from './utils/formatters'

export {createTransformer, createViewModel} from 'mobx-utils'

m.configure({computedRequiresReaction: true, enforceActions: true})

export const oObject = m.observable.object
export const oObject3 = _.curryN(3, m.observable.object)
export const createOObj = ({
  props = {},
  decorators = {},
  options = {},
} = {}) => oObject(props, decorators, options)
export const extendObservable = m.extendObservable
export const extendObservable2 = _.curryN(2, m.extendObservable)
export const extendObservable3 = _.curryN(3, m.extendObservable)
export const oArray = m.observable.array
export const oMap = m.observable.map
export const mSet = m.set
export const mValues = m.values
export const mAutoRun = m.autorun
export const mReaction = m.reaction
export const mRunInAction = m.runInAction
export const mTrace = m.trace
export const mJS = m.toJS
export const mSpy = m.spy
export const mIntercept = m.intercept
export const mActionBound = m.action.bound
export const mAction = m.action
export const mComputed = m.computed
export const t = mst.types
export const tModel = mst.types.model
export const tMap = mst.types.map

export const extendActions = _.curry((createActions, observable) => {
  const actions = createActions(observable)
  return extendObservable(
    observable,
    actions,
    _.map(_.always(mAction), actions),
  )
})

export const extendComputed = _.curry(
  (createComputed, observable) => {
    const computed = createComputed(observable)
    return extendObservable(
      observable,
      computed,
      _.map(_.always(mComputed), computed),
    )
  },
)

export const extendObservableWith = _.curry(
  (
    {
      props = {},
      views = RX.alwaysEmptyObject,
      actions = RX.alwaysEmptyObject,
    } = {},
    obs,
  ) => {
    return _.compose(
      extendComputed(views),
      extendActions(actions),
      extendObservable2(_.__, props),
    )(obs)
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

if (module.hot) {
  const window = global.window

  Object.assign(window, require('mobx'))
  Object.assign(window, require('mobx-utils'))

  window.devtoolsFormatters = window.devtoolsFormatters || []

  const formatters = [MapFormatter, ObjectFormatter, ArrayFormatter]

  const hotFormatters = _.compose(
    _.defaultTo([]),
    RB.path('hot.data.devtoolsFormatters'),
  )(module)

  window.devtoolsFormatters.unshift(
    ...formatters,
    ..._.without(hotFormatters, window.devtoolsFormatters),
  )

  module.hot.dispose(data => {
    data.devtoolsFormatters = formatters
  })
}

const oFoo = extendObservableWith({props: {_foo: 1}}, oObject({}))

mAutoRun(
  () => {
    console.log(`oFoo.foo`, oFoo.foo)
  },
  {name: 'oFoo.foo'},
)

console.log(`oFoo`, oFoo)
console.log(`oFoo`, mJS(oFoo))
