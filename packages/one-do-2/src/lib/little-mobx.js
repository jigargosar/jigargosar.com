import {storage} from './storage'
import {toJS} from 'mobx'
import {compose, defaultTo} from './ramda'

export function mobxStorage({store, key, disposers, preProcessStorageJS}) {
  function startStoring() {
    disposers.autorun(() => {
      // console.log(`toJS(store)`, toJS(store))
      compose(storage.set(key), toJS)(store)
    })
  }

  function loadStore() {
    const source = compose(preProcessStorageJS, defaultTo({}))(
      storage.get(key),
    )
    Object.assign(store, source)
  }

  return {
    loadAndStart() {
      loadStore()
      startStoring()
    },
  }
}

export function storeAsPrettyJSON(store) {
  return JSON.stringify(toJS(store), null, 2)
}
