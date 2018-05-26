const R = require('ramda')
const RA = require('ramda-adjunct')
const nanoid = require('nanoid')
const assert = require('assert')

const faker = require('faker')
faker.seed(123)

const idPropName = '_id'
const deletedPropName = '_deleted'
const revisionPropName = '_rev'
const textPropName = 'text'
const createdAtPropName = 'createdAt'

export function createNew({text} = {}) {
  return {
    [idPropName]: `grain-${nanoid()}`,
    text: R.isNil(text) ? `${faker.lorem.words()}` : text,
    [createdAtPropName]: Date.now(),
  }
}

export function setText(text, grain) {
  assert(RA.isString(text))
  return R.assoc(textPropName, text, grain)
}

export function setDeleted(grain) {
  assert(!R.has(deletedPropName)(grain))
  return R.assoc(deletedPropName, true)(grain)
}

export function setRevision(revision, grain) {
  return R.assoc(revisionPropName, revision, grain)
}

export function getText(grain) {
  return grain[textPropName]
}

export function getId(grain) {
  return grain[idPropName]
}

export function toPouchDBDoc(grain) {
  return RA.renameKeys({[idPropName]: '_id'}, grain)
}

export function fromPouchDBDoc(doc) {
  assert(RA.isNotNil(doc._id))
  return RA.renameKeys({_id: idPropName}, doc)
}

export const idEq = R.curry(function idEq(id, grain) {
  return R.propEq(idPropName, id, getId(grain))
})

export const eqById = R.curry(function idEq(grain1, grain2) {
  return R.eqProps(idPropName, grain1, grain2)
})
