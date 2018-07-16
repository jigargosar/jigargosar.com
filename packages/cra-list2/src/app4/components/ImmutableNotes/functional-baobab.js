import S from 'sanctuary'
import {_, constant} from '../../little-ramda'

export function maybeRight(cursor) {
  return S.toMaybe(cursor.right())
}

export function maybeUp(cursor) {
  return S.toMaybe(cursor.up())
}

export function cursorExist(cursor) {
  return cursor.exists()
}

export function maybeDownIfExists(cursor) {
  return _.compose(
    S.chain(_.ifElse(cursorExist)(S.Just)(constant(S.Nothing))),
    S.toMaybe,
  )(cursor.down())
}
