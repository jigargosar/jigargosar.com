const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert').strict

export async function put(doc, db) {
  assert.ok(R.has('_id')(doc))
  assert.notOk(R.has('id')(doc))
  const res = await db.put(doc)
  assert.ok(res.ok)
  assert.equals(res.id, doc._id)
  assert.notEquals(res.rev, doc._rev)
  return R.merge(doc, {_rev: res.rev})
}

export async function fetchDocsDescending(db) {
  return db.allDocs({include_docs: true, descending: true})
}

export function insert(doc, db) {
  assert.notOk(R.has('_rev')(doc))
  assert.notOk(R.has('_deleted')(doc))
  return put(doc, db)
}

export function update(doc, db) {
  assert.ok(R.has('_rev')(doc))
  assert.notOk(R.has('_deleted')(doc))
  return put(doc, db)
}

export function remove(doc, db) {
  assert.ok(R.has('_rev')(doc))
  assert.notOk(R.has('_deleted')(doc))
  return put(R.assoc('_deleted', true)(doc), db)
}
