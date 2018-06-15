import PouchDB from 'pouchdb-browser'
import ow from 'ow'
import {PouchStore} from './PouchStore'

const assert = require('assert')

if (!module.hot || !module.hot.data) {
  require('pouchdb-all-dbs')(PouchDB)
}

export const PouchService = (function PouchService() {
  return {
    getAllDbNames() {
      return PouchDB.allDbs()
    },
    create(name, options = {}) {
      ow(name, ow.string.minLength(3))
      return PouchStore(new PouchDB(name, options), this)
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
    PouchService.getAllDbNames().then(console.log),
  )
}
