import * as R from 'ramda'

export function LocalStorageItem(key, defaultValue) {
  const log = require('nanologger')(`ls-item:${key}`)

  function load() {
    return R.defaultTo(
      defaultValue,
      JSON.parse(window.localStorage.getItem(key)),
    )
  }

  function save(obj) {
    const serialisedObj = JSON.stringify(obj, null, 2)
    log.debug('serialised', serialisedObj)
    window.localStorage.setItem(key, serialisedObj)
  }

  return {
    save,
    load,
  }
}
