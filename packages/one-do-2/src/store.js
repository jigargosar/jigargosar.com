import {observable} from 'mobx'
import {Disposers} from './lib/little-mst'
import {compose, defaultTo, pick} from './lib/ramda'
import {autobind} from './lib/little-react'
import {storage} from './lib/storage'
import {toJS} from './lib/mobx'

@autobind
class Store {
  @observable title = 'One Do'

  get asJSON() {
    return storeAsPrettyJSON(this)
  }
}

export const store = new Store()

const disposers = Disposers(module)

const rootStorage = mobxStorage({
  store,
  key: 'rootStore',
  disposers,
  preProcessStorageJS: pick(Object.getOwnPropertyNames(store)),
})
rootStorage.loadAndStart()

function mobxStorage({store, key, disposers, preProcessStorageJS}) {
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
