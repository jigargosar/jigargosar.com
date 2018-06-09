const R = require('ramda')
const nanoid = require('nanoid')

function getOrSetLocalStorage(id, setValue) {
  let value = localStorage.getItem(id)
  if (R.isNil(value)) {
    value = localStorage.setItem(id, setValue)
  }
  return value
}

export function getAppActorId() {
  return getOrSetLocalStorage('app-actor-id', `actor-${nanoid()}`)
}
