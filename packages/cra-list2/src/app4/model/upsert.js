import {_, validate} from '../utils'

const upsert = _.curry(function upsert(
  options,
  objOrArr,
  collectionArray,
) {
  validate('OOA|OAA', [options, objOrArr, collectionArray])
  const {mapBeforeUpsert = _.identity, equals = _.equals} = options

  return _.compose(
    _.reduce((ca, item) => {
      const found = _.find(equals(item), ca)
      const updated = mapBeforeUpsert(item, found)
      const foundIdx = _.findIndex(equals(updated), ca)
      return foundIdx > -1
        ? _.update(foundIdx, updated, ca)
        : _.append(updated, ca)
    }, collectionArray),
    _.unless(_.is(Array), _.of),
  )(objOrArr)
})

upsert.displayName = 'upsert'

export {upsert}
