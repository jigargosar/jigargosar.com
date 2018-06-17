import PouchDB from 'pouchdb-browser'
import ow from 'ow'

const assert = require('assert')

if (!module.hot || !module.hot.data) {
  require('pouchdb-all-dbs')(PouchDB)
}

export const PouchDBService = (function PouchService() {
  return {
    getAllDbNames() {
      return PouchDB.allDbs()
    },
    create(name, options = {}) {
      ow(name, ow.string.minLength(3))
      return PouchDBHelper(new PouchDB(name, options), this)
    },
    exists(name) {
      return this.getAllDbNames().includes(name)
    },
    async destroy(name) {
      const allDbNames = await this.getAllDbNames()
      assert(allDbNames.includes(name))
      return new PouchDB(name).destroy()
    },
  }
})()

if (module.hot) {
  window.requestAnimationFrame(() =>
    PouchDBService.getAllDbNames().then(console.debug),
  )
}

const R = require('ramda')

function PouchDBHelper(db, service) {
  return {
    _db: db,
    get name() {
      return db.name
    },
    destroy() {
      return service.destroy(db.name)
    },
    get(id) {
      return db.get(id)
    },
    put(doc) {
      return db.put(doc)
    },
    allDocs() {
      return db.allDocs({include_docs: true})
    },
    async getAll() {
      const res = await this.allDocs()
      return R.map(R.prop('doc'), res.rows)
    },
    allChanges() {
      return db.changes({include_docs: true})
    },
    liveChanges({since}) {
      console.debug(this.name, 'liveChanges: since', since)
      return this.changes({since, live: true})
    },
    changes({since = 0, live = false, ...rest} = {}) {
      const changesOptions = {
        include_docs: true,
        since,
        live: live,
        ...rest,
      }
      const changes = db.changes(changesOptions)
      changes.on('error', e =>
        console.error('changes:', this.name, changesOptions, e),
      )
      return changes
    },
  }
}
