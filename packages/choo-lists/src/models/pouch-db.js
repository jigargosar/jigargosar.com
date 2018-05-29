const PouchDB = require('pouchdb-browser')
const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert').strict
const Logger = require('nanologger')

module.exports = createPouchDB

function put(actionMsg, doc, {db, log}) {
  assert(R.has('_id')(doc))
  assert(!R.has('id')(doc))
  return db.put(doc).then(res => {
    log.debug(`${actionMsg} result`, res)
    assert(res.ok)
    assert.equal(res.id, doc._id)
    assert.notEqual(res.rev, doc._rev)
    const mergedDoc = R.merge(doc, {_rev: res.rev})
    log.debug(actionMsg, mergedDoc)
    return mergedDoc
  })
}

function fetchDocsDescending({db, log}) {
  return db
    .allDocs({include_docs: true, descending: true})
    .then(R.compose(R.map(R.prop('doc')), R.prop('rows')))
    .then(R.tap(docs => log.trace('docs', ...docs)))
}

function insert(doc, pdb) {
  assert(!R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put('insert', doc, pdb)
}

function update(doc, pdb) {
  assert(R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put('update', R.merge(doc, {modifiedAt: Date.now()}), pdb)
}

function remove(doc, pdb) {
  assert(R.has('_rev')(doc))
  assert(!R.has('_deleted')(doc))
  return put('delete', R.merge(doc, {_deleted: true}), pdb)
}

function createPouchDB(name) {
  const db = new PouchDB(name)

  const log = Logger(`pouch-db(${name})`)

  db.info().then(info => log.debug('db_info', info))

  function partialDB(fn) {
    return R.partialRight(fn, [{db, log}])
  }

  return {
    fetchDocsDescending: partialDB(fetchDocsDescending),
    insert: partialDB(insert),
    update: partialDB(update),
    remove: partialDB(remove),
    _db: db,
  }
}
