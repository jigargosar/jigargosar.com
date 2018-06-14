// const m = require('mobx')
const ow = require('ow').default
const R = require('ramda')

function stringifyAndSetItem(key, value) {
  ow(key, ow.string.nonEmpty)
  return window.localStorage.setItem(key, JSON.stringify(value))
}

function getVaue(key) {
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
      const value = getVaue(key)
      if (R.isNil(value)) {
        stringifyAndSetItem(key, defaultValue)
      }
      return getVaue(key)
    },
    set(key, value) {
      return stringifyAndSetItem(key, value)
    },
  }
})()

export const ls = LocalStorageStore
