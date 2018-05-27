const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')

export async function put(doc, db) {
  assert(R.has('_id')(doc))
  assert(!R.has('id')(doc))
  const res = await db.put(doc)
  assert(res.ok)
  assert(R.equals(res.id, doc._id))
  assert(!R.equals(res.rev, doc._rev))
  return R.merge(doc, {_rev: res.rev})
}

export function insert(doc, db) {
  assert(!R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put(doc, db)
}

export function update(doc, db) {
  assert(R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put(doc, db)
}

export function remove(doc, db) {
  assert(R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put(R.assoc('_deleted', true)(doc), db)
}
