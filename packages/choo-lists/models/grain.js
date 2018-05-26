const R = require('ramda')
const RA = require('ramda-adjunct')
const nanoid = require('nanoid')
const assert = require('assert')

const faker = require('faker')
faker.seed(123)

const idPropName = 'id'

export function createNew({text} = {}) {
  return {
    id: `grain-${nanoid()}`,
    text: R.isNil(text) ? `${faker.lorem.words()}` : text,
  }
}

export function updateText(text, grain) {
  return R.assoc('text', text, grain)
}

export function setDeleted(grain) {
  assert(!R.has('_deleted')(grain))
  return R.merge({_deleted: true})(grain)
}

export function updateRev(rev, grain) {
  return R.assoc('_rev', rev, grain)
}

export function text(grain) {
  return grain.text
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
  return R.propEq(idPropName, id, id(grain))
})

export const eqById = R.curry(function idEq(grain1, grain2) {
  return R.eqProps(idPropName, grain1, grain2)
})
