import PouchDB from 'pouchdb-browser'
import 'pouchdb-all-dbs'
import ow from 'ow'
export function PouchCollectionStore(dbName) {
  ow(dbName, ow.string.minLength(3))
  const db = new PouchDB(dbName)
}
