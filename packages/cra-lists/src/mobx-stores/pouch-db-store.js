export function PouchDBStore(db) {
  return {
    get name() {
      return db.name
    },
  }
}
