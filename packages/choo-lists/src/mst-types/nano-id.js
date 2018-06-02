import {types} from 'mobx-state-tree/dist/index'

function isValidNanoId(id) {
  assert(id.length, 12)
  return id
}


export const nanoId = types.refinement(types.string, v =>
  v.match(isValidNanoId),
)


export const timestamp = types.optional(types.number, () => Date.now())