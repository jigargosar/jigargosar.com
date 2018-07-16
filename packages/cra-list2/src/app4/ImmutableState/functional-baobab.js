import S from 'sanctuary'
import {_, constant, isNotNil} from '../little-ramda'

export function maybeRight(cursor) {
  return S.toMaybe(cursor.right())
}

export function maybeLeft(cursor) {
  return S.toMaybe(cursor.left())
}

export function maybeUp(cursor) {
  return S.toMaybe(cursor.up())
}

export function doesCursorExist(cursor) {
  return cursor.exists()
}

const toMaybeCursorIfExists = _.compose(
  S.chain(_.ifElse(doesCursorExist)(S.Just)(constant(S.Nothing))),
  S.toMaybe,
)
export function maybeDownIfExists(cursor) {
  return toMaybeCursorIfExists(cursor.down())
}

export function isCursorRoot(cursor) {
  return cursor.isRoot()
}

export function maybeRightmostIfExists(cursor) {
  return toMaybeCursorIfExists(cursor.rightmost())
}

export function releaseCursorIfNotNil(cursor) {
  if (isNotNil(cursor) && !cursor.state.killed) {
    cursor.release()
  }
}
