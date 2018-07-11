import * as R from 'ramda'
import * as RX from 'ramda-extension'
import validate from './vendor/aproba'
import * as RA from 'ramda-adjunct'
import assert from 'assert'

const _ = R

export {_, R, RX, RA, validate}

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

export const tapLog = tapLogWith('tapLog')

export function wrapTapLog(fn) {
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
