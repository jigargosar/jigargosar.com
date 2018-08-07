import {
  _compose,
  _when,
  addIndex,
  always,
  clamp,
  curryN,
  defaultTo,
  forEach,
  isEmpty,
  length,
  map,
  mergeDeepRight,
  nAry,
  reduce,
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

export const T1 = obj => fn => fn(obj)
export const composeExt = (...ext) => self =>
  _compose(reduce(mergeDeepRight)({}), map(T1(self)))(ext)

export function clampArrIdx(selectedNoteIdx, allNotes) {
  return clamp(0)(allNotes.length - 1)(selectedNoteIdx)
}

export const mapFirst = fn => map(([l, r]) => [fn(l), r])
export const mapSecond = fn => map(([l, r]) => [l, fn(r)])
export const mapBoth = fn => map(([l, r]) => [fn(l), fn(r)])
export const mapEach = fnl => fnr => map(([l, r]) => [fnl(l), fnr(r)])
