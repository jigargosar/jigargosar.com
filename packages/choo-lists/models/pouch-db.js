const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')

export function put(doc, db) {
  assert(!R.has('id')(doc))
  return db.put(doc)
}
