import {_, validate} from '../utils'

const upsert = _.curry(function upsert(
  options,
  objOrArr,
  collectionArray,
) {
  validate('OOA|OAA', [options, objOrArr, collectionArray])
})

upsert.displayName = 'upsert'

export {upsert}
