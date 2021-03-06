import {
  _compose,
  _when,
  addIndex,
  always,
  clamp,
  curry,
  curryN,
  defaultTo,
  forEach,
  isEmpty,
  length,
  lensPath,
  lensProp,
  map,
  mergeDeepRight,
  nAry,
  over,
  propEq,
  reduce,
  tap,
} from './ramda'
import Sugar from 'sugar'
import pFinally from 'p-finally'

export {default as pluralize} from 'pluralize'

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
export {default as validate} from './aproba/index'
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
export const overProp = pn => over(lensProp(pn))
export const overPath = pt => over(lensPath(pt))
export const pDrop = asyncFn => {
  let retPromise = null

  return (...args) => {
    if (!retPromise) {
      retPromise = asyncFn(...args)

      pFinally(retPromise, () => (retPromise = null))
    }

    return retPromise
  }
}
export const findById = id => list => list.find(propEq('id', id))
export const ifElse_ = (bool, t, f) => {
  return bool ? t : f
}

export const defineDelegatePropertyGetter = curry(
  (propertyName, src, target) =>
    Object.defineProperty(target, propertyName, {
      get() {
        return src[propertyName]
      },
      enumerable: true,
    }),
)
