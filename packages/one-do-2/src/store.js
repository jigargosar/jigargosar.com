import {observable} from 'mobx'
import {Disposers} from './lib/little-mst'
import {mobxStorage} from './lib/little-mobx'
import {extendObservable, toJS} from './lib/mobx'
import {pick} from './lib/ramda'

export const store = observable({
  title: 'One Do',
  get asJSOn() {
    return storeAsJSON()
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

export function storeAsJSON() {
  return JSON.stringify(toJS(store), null, 2)
}
