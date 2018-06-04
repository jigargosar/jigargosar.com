const assert = require('assert')
import {types} from 'mobx-state-tree'
import nanoid from 'nanoid'

const log = require('nanologger')('mst-types')

function isValidNanoId(id) {
  const isValidNanoId = id.length >= 21
  assert(isValidNanoId)
  return isValidNanoId
}

const nanoId = types.refinement(
  'NanoId',
  types.identifier(types.string),
  isValidNanoId,
)
export const optionalNanoId = types.optional(nanoId, () => nanoid())

export const timestamp = types.optional(types.number, () =>
  Date.now(),
)
