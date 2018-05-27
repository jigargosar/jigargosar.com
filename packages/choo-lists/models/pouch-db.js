const PouchDB = require('pouchdb-browser')
const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert').strict
const Logger = require('nanologger')

module.exports = createPouchDB

async function put(doc, db) {
  assert(R.has('_id')(doc))
  assert(!R.has('id')(doc))
  const res = await db.put(doc)
  assert(res.ok)
  assert.equal(res.id, doc._id)
  assert.notEqual(res.rev, doc._rev)
  return R.merge(doc, {_rev: res.rev})
}

async function fetchDocsDescending(db) {
  return db.allDocs({include_docs: true, descending: true})
}

function insert(doc, db) {
  assert(!R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put(doc, db)
}

function update(doc, db) {
  assert(R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put(doc, db)
}

function remove(doc, db) {
  assert(R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put(R.assoc('_deleted', true)(doc), db)
}

function createPouchDB(name) {
  const db = new PouchDB(name)

  const log = Logger(`PDB:${name}`)

  db.info().then(info => log.debug('DB Info', info))

  function partialDB(fn) {
    return R.partialRight(fn, [db])
  }

  return {
    fetchDocsDescending: partialDB(fetchDocsDescending),
    insert: partialDB(insert),
    update: partialDB(update),
    remove: partialDB(remove),
  }
}
