// const m = require('mobx')
const ow = require('ow').default
const R = require('ramda')

function stringifyAndSetItem(key, value) {
  ow(key, ow.string.nonEmpty)
  return window.localStorage.setItem(key, JSON.stringify(value))
}

function getParsedOrExactItem(key) {
  const value = window.localStorage.getItem(key)
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

export const LocalStorageService = (function LocalStorageStore() {
  return {
    getOr(defaultValue, key) {
      ow(key, ow.string.nonEmpty)
      const value = getParsedOrExactItem(key)
      if (R.isNil(value)) {
        stringifyAndSetItem(key, defaultValue)
      }
      return getParsedOrExactItem(key)
    },
    set(key, value) {
      return stringifyAndSetItem(key, value)
    },
  }
})()

export function createLSItem(key, defaultValue) {
  return {
    get: () => LocalStorageService.getOr(defaultValue, key),
    set: value => LocalStorageService.set(key, value),
  }
}
