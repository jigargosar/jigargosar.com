import {storage} from './storage'
import {toJS} from 'mobx'
import {compose, defaultTo} from './ramda'

export function mobxStorage(store, storageKey, disposers) {
  function startStoring() {
    disposers.autorun(() => {
      // console.log(`toJS(store)`, toJS(store))
      compose(storage.set(storageKey), toJS)(store)
    })
  }

  function loadStore() {
    Object.assign(store, defaultTo({})(storage.get(storageKey)))
  }

  return {
    loadAndStart() {
      loadStore()
      startStoring()
    },
  }
}
