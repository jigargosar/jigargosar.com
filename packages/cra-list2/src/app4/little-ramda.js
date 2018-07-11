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

function _swapElementsAt(x, y, a) {
  // const [ax, ay] = [a[x], a[y]]
  // a[x] = ay
  // a[y] = ax
  return _.compose(_.update(y, a[x]), _.update(x, a[y]))(a)
}

export const swapElementsAt = _.curry(_swapElementsAt)

function _isInvalidListIdx(idx, list) {
  return idx < 0 || idx >= list.length
}

export const isInvalidListIdx = _.curry(_isInvalidListIdx)

function _prop(propName, obj) {
  assert(R.hasIn(propName, obj))
  return R.prop(propName, obj)
}

function _omit(props, obj) {
  assert(RA.isArray(props))
  return R.omit(props, obj)
}

function _pick(props, obj) {
  assert(RA.isArray(props))
  return R.pick(props, obj)
}

export function tryCatchLogError(trier) {
  return _.tryCatch(trier, console.error)
}

export const tapDebug = _.tap(x => {
  console.log(x)
  debugger
})

export const tapLog = _.tap(x => {
  console.log(x)
})

export const vProp = R.curry(_prop)
export const vOmit = R.curry(_omit)
export const vPick = R.curry(_pick)
