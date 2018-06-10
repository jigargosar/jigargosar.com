import * as R from 'ramda'

const log = require('nanologger')(`local-storage-item`)
export function LocalStorageItem(key, defaultValue) {
  function load() {
    return R.defaultTo(
      defaultValue,
      JSON.parse(window.localStorage.getItem(key)),
    )
  }

  function save(obj) {
    const serialisedObj = JSON.stringify(obj, null, 2)
    log.trace(`saving ${key} =`, serialisedObj)
    window.localStorage.setItem(key, serialisedObj)
  }

  return {
    save,
    load,
  }
}
