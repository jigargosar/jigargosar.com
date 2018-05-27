import PouchDB from "pouchdb-browser";
import * as R from "ramda";
import Logger from "nanologger";

const assert = require("assert");

async function put(actionMsg, doc, { db, log }) {
  assert(R.has("_id")(doc));
  assert(!R.has("id")(doc));
  const res = await db.put(doc);
  log.debug(`${actionMsg} result`, res);
  assert(res.ok);
  assert.equal(res.id, doc._id);
  assert.notEqual(res.rev, doc._rev);
  const mergedDoc = R.merge(doc, { _rev: res.rev });
  log.debug(actionMsg, mergedDoc);
  return mergedDoc;
}

async function fetchDocsDescending({ db, log }) {
  const res = await db.allDocs({ include_docs: true, descending: true });
  const docs = R.compose(R.map(R.prop("doc")), R.prop("rows"))(res);
  log.trace("docs", ...docs);
  return docs;
}

async function insert(doc, pdb) {
  assert(!R.has("_rev")(doc));
  assert(!R.has("_deleted")(doc));
  return put("insert", doc, pdb);
}

async function update(doc, pdb) {
  assert(R.has("_rev")(doc));
  assert(!R.has("_deleted")(doc));
  return put("update", doc, pdb);
}

async function remove(doc, pdb) {
  assert(R.has("_rev")(doc));
  assert(!R.has("_deleted")(doc));
  return put("delete", R.assoc("_deleted", true)(doc), pdb);
}

function createPouchDB(name) {
  const db = new PouchDB(name);

  const log = Logger(`PDB:${name}`);

  db.info().then(info => log.debug("DB Info", info));

  function partialDB(fn) {
    return R.partialRight(fn, [{ db, log }]);
  }

  return {
    fetchDocsDescending: partialDB(fetchDocsDescending),
    insert: partialDB(insert),
    update: partialDB(update),
    remove: partialDB(remove)
  };
}

export default createPouchDB;
