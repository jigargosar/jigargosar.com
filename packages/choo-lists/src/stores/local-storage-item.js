const assert = require('assert')
const R = require('ramda')

module.exports = LocalStorageItem

function LocalStorageItem(key, defaultValue) {
  const log = require('nanologger')(`ls-item:${key}`)

  function load() {
    return R.defaultTo(defaultValue, JSON.parse(localStorage.getItem(key)))
  }

  function save(obj) {
    const serialisedObj = JSON.stringify(obj, null, 2)
    log.debug('serialised', serialisedObj)
    localStorage.setItem(key, serialisedObj)
  }

  return {
    save,
    load,
  }
}
