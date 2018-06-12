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
    async allDocsArray() {
      const res = await this.allDocs()
      return R.map(R.prop('doc'), res.rows)
    },
    allChanges() {
      return db.changes({include_docs: true})
    },
    liveChanges({since}) {
      const changes = db.changes({
        include_docs: true,
        since,
        live: true,
      })
      changes.on('error', e =>
        console.error('liveChanges:', this.name, e),
      )
      return changes
    },
  }
}
