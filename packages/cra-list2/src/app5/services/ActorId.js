import {storage} from './storage'
import {_, validate} from '../little-ramda'
import {nanoid} from '../little-model'

export const localActorId = (() => {
  const storedLocalActorId = storage.get('localActorId')
  if (_.isNil(storedLocalActorId)) {
    storage.set('localActorId', nanoid())
    return storage.get('localActorId')
  }
  return storedLocalActorId
})()

export function shortenAID(aid) {
  validate('S', [aid])
  return _.take(4, aid)
}
