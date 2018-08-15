import {observable} from 'mobx'
import {Disposers} from './lib/little-mst'
import {mobxStorage} from './lib/little-mobx'
import {toJS} from './lib/mobx'

export const store = observable({})
const disposers = Disposers(module)

const rootStorage = mobxStorage(store, 'rootStore', disposers)
rootStorage.loadAndStart()

export function storeAsJSON() {
  return JSON.stringify(toJS(store), null, 2)
}
