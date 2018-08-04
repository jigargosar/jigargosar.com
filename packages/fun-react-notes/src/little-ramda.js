import {
  _compose,
  _when,
  addIndex,
  always,
  curryN,
  defaultTo,
  forEach,
  isEmpty,
  length,
  map,
  tap,
} from './ramda'

export function tapLog2(msg) {
  return tap(args => console.warn(msg, args))
}

export const tapLog = tapLog2('tapLog')

export function wrapLog(fn, name = 'wrapTapLog fn') {
  const fnName = _compose(_when(isEmpty)(always(name)), defaultTo(''))(
    fn.name,
  )
  return curryN(length(fn), (...args) => {
    console.warn(`${fnName}`, 'in', args)
    const out = fn(...args)
    console.warn(fnName, 'out', out)
    return out
  })
}
export {default as validate} from './vendor/aproba'
export const mapIndexed = addIndex(map)
export const forEachIndexed = addIndex(forEach)

if (module.hot) {
  window._ = require('ramda')
}
