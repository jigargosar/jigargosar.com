import {createStore} from './createStore'
import {isNil} from '../lib/ramda'

let store

export function getStore() {
  if (isNil(store)) {
    store = createStore()
  }
  return store
}

export {store}
