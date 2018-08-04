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
  mergeAll,
  nAry,
  tap,
} from './ramda'
import Sugar from 'sugar'

if (module.hot) {
  window._ = require('ramda')
}

export const tapLog2 = msg => tap(args => console.warn(msg, args))

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

export function sugarExtend() {
  Sugar.extend()

  Sugar.Function.defineInstance({
    l: nAry(2, (fn, name = 'wrapTapLog fn') => {
      const fnName = _compose(_when(isEmpty)(always(name)), defaultTo(''))(
        fn.name,
      )
      return curryN(length(fn), (...args) => {
        console.warn(`${fnName}`, 'in', args)
        const out = fn(...args)
        console.warn(fnName, 'out', out)
        return out
      })
    }),
  })
}

export const hmrBoot = (module, render, acceptModules) => {
  if (module.hot) {
    console.log('Cold Boot')
    module.hot.accept(acceptModules, () => {
      console.clear()
      console.log('Hot Reload')
      render()
    })
  }
}
export const T1 = obj => fn => fn(obj)
export const composeExt = (...ext) => self =>
  _compose(mergeAll, map(T1(self)))(ext)
