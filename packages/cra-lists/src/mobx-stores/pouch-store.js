export function PouchStore(db) {
  return {
    get name() {
      return db.name
    },
  }
}
