const {getAppActorId} = require('../stores/actor-id')
const R = require('ramda')
const RA = require('ramda-adjunct')
const nanoid = require('nanoid')
const assert = require('assert')

const idPropName = '_id'
const deletedPropName = '_deleted'
const revisionPropName = '_rev'
const versionPropName = 'version'
const actorIdPropName = 'actorId'
const textPropName = 'text'
const createdAtPropName = 'createdAt'
const modifiedAtPropName = 'modifiedAt'

export function createNew({text = ''} = {}) {
  const nowTimestamp = Date.now()
  assert(RA.isNotNil(text))
  return {
    [idPropName]: `grain-${nowTimestamp}-${nanoid()}`,
    text,
    [createdAtPropName]: nowTimestamp,
    [actorIdPropName]: getAppActorId(),
    [modifiedAtPropName]: nowTimestamp,
  }
}

export function setText(text, grain) {
  assert(RA.isString(text))
  return R.merge(grain, {
    [textPropName]: text,
    [actorIdPropName]: getAppActorId(),
    [modifiedAtPropName]: Date.now(),
  })
}

export function setDeleted(grain) {
  return R.merge(grain, {
    [deletedPropName]: true,
    [actorIdPropName]: getAppActorId(),
    [modifiedAtPropName]: Date.now(),
  })
}

export function getText(grain) {
  return grain[textPropName]
}

export function getId(grain) {
  return grain[idPropName]
}

export function getActorId(grain) {
  return grain[actorIdPropName]
}

export function getModifiedAt(grain) {
  return grain[modifiedAtPropName]
}

export function isLocal(grain) {
  return getActorId(grain) === getAppActorId()
}

export function validate(doc) {
  assert(RA.isString(doc[idPropName]))
  assert(RA.isString(doc[revisionPropName]))
  assert(RA.isString(doc[textPropName]))
  assert(RA.isNumber(doc[createdAtPropName]))
  assert(RA.isNumber(doc[modifiedAtPropName]))
  assert(RA.isString(doc[actorIdPropName]))
  return doc
}

export const idEq = R.curry(function idEq(id, grain) {
  return R.propEq(idPropName, id, grain)
})

export const eqById = R.curry(function idEq(grain1, grain2) {
  return R.eqProps(idPropName, grain1, grain2)
})

export function isFlaggedAsDeleted(grain) {
  R.propOr(false, '_deleted', grain)
}
