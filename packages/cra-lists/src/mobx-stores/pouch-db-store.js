import PouchDB from 'pouchdb-browser'
import ow from 'ow'
export function PouchCollectionStore(dbName) {
  ow(dbName, ow.string.minLength(3))
}
