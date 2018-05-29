const R = require('ramda')
const RA = require('ramda-adjunct')
const nanoid = require('nanoid')

export function getAppActorId() {
  const actorIdKey = 'choo-list:actorId'
  const lsActorId = localStorage.getItem(actorIdKey)
  if (R.isNil(lsActorId)) {
    const actorId = `actorId-${Date.now()}-${nanoid()}`
    localStorage.setItem(actorIdKey, actorId)
    return actorId
  }
  return lsActorId
}
