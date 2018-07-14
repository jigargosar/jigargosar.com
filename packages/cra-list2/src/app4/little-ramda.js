import * as R from 'ramda'
import * as RX from 'ramda-extension'
import validate from './vendor/aproba'
import * as RA from 'ramda-adjunct'
import assert from 'assert'
import S from 'sanctuary'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

const _ = R

export {_, R, RX, RA, validate, S, debounce, throttle}

if (module.hot) {
  Object.assign(window, require('ramda'))
}

export const isNotNil = _.complement(_.isNil)

export const dotPath = _.curry(function dotPath(stringPath, obj) {
  validate('SO', [stringPath, obj])
  return _.path(stringPath.split('.'), obj)
})

export const dotPathOr = _.curry(function dotPathOr(
  val,
  stringPath,
  obj,
) {
  return _.defaultTo(val, dotPath(stringPath, obj))
})

export const mapIndexed = _.addIndex(_.map)

export const forEachIndexed = _.addIndex(_.forEach)

export const swapElementsAt = _.curry(function swapElementsAt(
  x,
  y,
  a,
) {
  return _.compose(_.update(y, a[x]), _.update(x, a[y]))(a)
})

export const isIndexOutOfBounds = _.curry(function isIndexOutOfBounds(
  idx,
  list,
) {
  validate('NA', [idx, list])
  return idx < 0 || idx >= list.length
})

export function tryCatchLog(trier) {
  return _.tryCatch(trier, console.error)
}

export const tapDebug = _.tap(x => {
  console.warn(x)
  debugger
})

export function tapLogWith(msg) {
  return _.tap(args => console.warn(msg, args))
}

export function tapShowWith(msg) {
  return _.tap(args => console.warn(msg, S.show(args)))
}

export const tapLog = tapLogWith('tapLog')

export const tapShow = tapLogWith('tapShow')

export function wrapLog(fn) {
  const fnName = _.defaultTo('wrapTapLog fn', fn.name)
  return _.curryN(_.length(fn), (...args) => {
    console.warn(`${fnName}`, 'in', args)
    const out = fn(...args)
    console.warn(fnName, 'out', out)
    return out
  })
}

export const vProp = _.curry(function vProp(propName, obj) {
  assert(_.hasIn(propName, obj))
  return _.prop(propName, obj)
})

export const vOmit = _.curry(function vOmit(props, obj) {
  assert(RA.isArray(props))
  return _.omit(props, obj)
})

export const vPick = _.curry(function vPick(props, obj) {
  assert(RA.isArray(props))
  return _.pick(props, obj)
})

export function nop() {}

export function isNilOrEmpty(nilOrStrOrArr) {
  validate('Z|A|S', [nilOrStrOrArr])
  // return _.isNil(nilOrStrOrArr) || _.isEmpty(nilOrStrOrArr)
  return _.anyPass([_.isNil, _.isEmpty])(nilOrStrOrArr)
}

export function constant(val) {
  return _.always(val)
}

export const idEq = _.curry(function idEq(id, obj) {
  return _.propEq('id', id, obj)
})

export const eqIds = _.eqProps('id')

export const maybeHead = S.head

// maybeOrElse :: (_ -> b) -> Maybe a -> Maybe b
export const maybeOrElse = _.when(S.isNothing)

export function maybeOr(defaultValue) {
  return S.maybe(defaultValue)(S.I)
}

export const isNotEmpty = _.complement(_.isEmpty)
export const mergeWithDefaults = _.mergeWith(_.defaultTo)
