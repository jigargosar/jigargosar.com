import * as _ from 'ramda'
export {_}

export {
  map as _map,
  forEachObjIndexed as _forEachObjIndexed,
  type as _type,
  contains as _contains,
  times as _times,
  append as _append,
  compose as _compose,
  startsWith as _startsWith,
  path as _path,
  tap as _tap,
  cond as _cond,
  merge as _merge,
} from 'ramda'

export const mapIndexed = _.addIndex(_.map)
