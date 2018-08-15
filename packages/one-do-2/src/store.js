import {observable} from 'mobx'
import {Disposers} from './lib/little-mst'
import {mobxStorage, storeAsPrettyJSON} from './lib/little-mobx'
import {pick} from './lib/ramda'

export const store = observable({
  title: 'One Do',
  get asJSON() {
    return storeAsPrettyJSON(store)
  },
})

// extendObservable(store, {
//   counter: 10,
// })

const disposers = Disposers(module)

const rootStorage = mobxStorage({
  store,
  key: 'rootStore',
  disposers,
  preProcessStorageJS: pick(Object.getOwnPropertyNames(store)),
})
rootStorage.loadAndStart()
