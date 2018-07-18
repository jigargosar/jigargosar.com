import nanoid from 'nanoid'
import {_} from '../little-ramda'
import pluralize from 'pluralize'
export {nanoid, pluralize}

// function clampListIdx(list, idx) {
//   if (list.length < 0) {
//     return -1
//   }
//   return _.clamp(0, list.length - 1, idx)
// }

export const clampIdx = _.curry(function clampIdx(listLength, idx) {
  if (listLength < 0) {
    return -1
  }
  return _.clamp(0, listLength - 1, idx)
})

export const cycleIdx = _.curry(function cycleIdx(listLength, idx) {
  if (listLength <= 0) {
    return -1
  } else if (idx < 0) {
    return listLength - 1
  } else if (idx >= listLength) {
    return 0
  }
  return idx
})
