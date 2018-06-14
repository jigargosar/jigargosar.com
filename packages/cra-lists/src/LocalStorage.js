const R = require('ramda')
const nanoid = require('nanoid')

function getOrSetLocalStorage(id, setValue) {
  let value = window.localStorage.getItem(id)
  if (R.isNil(value)) {
    value = window.localStorage.setItem(id, setValue)
  }
  return JSON.parse(value)
}

export function getAppActorId() {
  return getOrSetLocalStorage('app-actor-id', `actor-${nanoid()}`)
}
