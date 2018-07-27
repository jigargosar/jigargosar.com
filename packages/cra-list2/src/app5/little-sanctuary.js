import S from 'sanctuary'
import {C, findById, R} from './little-ramda'

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

export const dotPath = strPath => S.gets(S.I)(strPath.split('.'))
export const nothingWhen = pred => elseFn =>
  R.ifElse(pred)(alwaysNothing)(C(Just, elseFn))

export const pOr = dv => pathStr => maybeOr(dv)(dotPath(pathStr))
