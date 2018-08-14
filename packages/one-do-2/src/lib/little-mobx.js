import {compose} from 'ramda'
import {storage} from './storage'
import {toJS} from 'mobx'

export function mobxStorage(store, storageKey, disposers) {
  function startStoring() {
    disposers.autorun(() => {
      console.log(
        `toJS(store)`,
        compose(storage.set(storageKey), toJS)(store),
      )
    })
  }

  function loadStore() {
    Object.assign(store, storage.get(storageKey))
  }

  return {
    loadAndStart() {
      loadStore()
      startStoring()
    },
  }
}
