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
  console.log(x)
  debugger
})

export const tapLog = _.tap(x => {
  console.log(x)
})

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
