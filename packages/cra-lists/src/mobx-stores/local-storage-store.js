// const m = require('mobx')
const ow = require('ow').default
const R = require('ramda')

function stringifyAndSetItem(key, value) {
  ow(key, ow.string.nonEmpty)
  return window.localStorage.setItem(key, JSON.stringify(value))
}

function getValue(key) {
  const value = window.localStorage.getItem(key)
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

export const LocalStorageStore = (function LocalStorageStore() {
  return {
    getOr(defaultValue, key) {
      ow(key, ow.string.nonEmpty)
      const value = getValue(key)
      if (R.isNil(value)) {
        stringifyAndSetItem(key, defaultValue)
      }
      return getValue(key)
    },
    set(key, value) {
      return stringifyAndSetItem(key, value)
    },
  }
})()

export function createLSItem(key, defaultValue) {
  return {
    get: () => ls.getOr(defaultValue, key),
    set: value => ls.set(key, value),
  }
}

export const ls = LocalStorageStore
