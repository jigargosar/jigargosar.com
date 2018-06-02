const assert = require('assert')
import {types} from 'mobx-state-tree'
import nanoid from 'nanoid'

const log = require('nanologger')('mst-types')

function isValidNanoId(id) {
  assert.equal(id.length, 21)
  return id.length === 21
}

const _nanoId = types.refinement('NanoId', types.string, isValidNanoId)
export const nanoId = types.optional(_nanoId, () => nanoid())

export const timestamp = types.optional(types.number, () => Date.now())
