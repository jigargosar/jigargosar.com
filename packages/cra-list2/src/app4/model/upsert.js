import {_, validate} from '../utils'

const upsert = _.curry(function upsert(
  options,
  objOrArr,
  collectionArray,
) {
  validate('OOA|OAA', [options, objOrArr, collectionArray])
  const {mapBeforeUpsert = _.identity, equals = _.equals} = options
  return _.compose(
    _.concat(collectionArray),
    _.map(mapBeforeUpsert),
    _.unless(_.is(Array), _.of),
  )(objOrArr)
})

upsert.displayName = 'upsert'

export {upsert}
