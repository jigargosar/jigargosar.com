import S from 'sanctuary'
import {C, findById, isIndexOutOfBounds, R} from './little-ramda'
export {
  chain as sChain,
  maybeToNullable as sMaybeToNullable,
  gets as sGets,
  get as sGet,
  I as SI,
} from 'sanctuary'

// export const maybeToNullable = S.maybeToNullable

if (module.hot) {
  window.S = S
}

export function tapShowWith(msg) {
  return R.tap(args => console.warn(msg, S.show(args)))
}

export const tapShow = tapShowWith('tapShow')

export const maybeHead = S.head

// maybeOrElse :: (_ -> b) -> Maybe a -> Maybe b
export const maybeOrElse = R.when(S.isNothing)

export function maybeOr(defaultValue) {
  return S.maybe(defaultValue)(S.I)
}

export function maybeOr_(fn) {
  return S.maybe_(fn)(S.I)
}

export const maybeOrNil = S.maybe_(() => null)

export const alwaysNothing = R.always(S.Nothing)

export const findByMaybeId = R.curry(function findByMaybeId(
  maybeId,
  arr,
) {
  return S.map(R.flip(findById)(arr))(maybeId)
})

export const Nothing = S.Nothing
export const Just = S.Just
export const toMaybe = S.toMaybe

export const dotPathIf = pred => strPath =>
  S.gets(pred)(strPath.split('.'))

export const dotPath = strPath => S.gets(R.T)(strPath.split('.'))
export const nothingWhenElse = pred => elseFn =>
  R.ifElse(pred)(alwaysNothing)(C(Just, elseFn))

export const nothingWhen = pred => nothingWhenElse(pred)(S.I)
export const dotPathOr = dv => pathStr =>
  C(maybeOr(dv), dotPath(pathStr))

export const unlessPath = p => o => dotPathOr(o)(p)(o)

export const elemAt = idx =>
  C(S.join, nothingWhenElse(isIndexOutOfBounds(idx))(S.at(idx)))
