import * as R from 'ramda'
import * as RX from 'ramda-extension'
import * as RB from 'rambdax'
import validate from 'aproba'
import RA from 'ramda-adjunct'

const _ = R

export {_, R, RX, RB, RA, validate}

if (module.hot) {
  Object.assign(window, require('ramda'))
}

function _swapElementsAt(x, y, a) {
  const [ax, ay] = [a[x], a[y]]
  a[x] = ay
  a[y] = ax
}

export const swapElementsAt = _.curry(_swapElementsAt)

function _isInvalidListIdx(idx, list) {
  return idx < 0 || idx >= list.length
}

export const isInvalidListIdx = _.curry(_isInvalidListIdx)
