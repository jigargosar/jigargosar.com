// import nanoid from 'nanoid'
const R = require('ramda')

export function PouchStore(db, service) {
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
