import {observable} from 'mobx'
import {Disposers} from './lib/little-mst'
import {mobxStorage} from './lib/little-mobx'

export const store = observable({
  counter: 0,
})

function incCounter() {
  store.counter++
}

const disposers = Disposers(module)

const rootStorage = mobxStorage(store, 'rootStore', disposers)

export function startStoreReactions() {
  disposers.dispose()

  disposers.setInterval(() => {
    incCounter()
  }, 1000)

  rootStorage.loadAndStart()
}

export function stopStoreReactions() {
  disposers.dispose()
}
