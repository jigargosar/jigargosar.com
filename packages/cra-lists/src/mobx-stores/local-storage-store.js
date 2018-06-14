const m = require('mobx')
const ow = require('ow').default
const R = require('ramda')

function stringifyAndSetItem(key, defaultValue) {
  return window.localStorage.setItem(
    key,
    JSON.stringify(defaultValue),
  )
}

function getParsedValueOrValue(key) {
  const value = window.localStorage.getItem(key)
  try {
    return JSON.stringify(value)
  } catch (e) {
    return value
  }
}

export const LocalStorageStore = (function LocalStorageStore() {
  return m.observable({
    getOr(defaultValue, key) {
      ow(defaultValue, ow.nullOrUndefined.not)
      ow(key, ow.string.nonEmpty)
      const value = getParsedValueOrValue(key)
      if (R.isNil(value)) {
        stringifyAndSetItem(key, defaultValue)
      }
      return getParsedValueOrValue()
    },
    set(key, value) {
      return stringifyAndSetItem(key, value)
    },
  })
})()

export const ls = LocalStorageStore
