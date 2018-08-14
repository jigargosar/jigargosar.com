import {observable} from 'mobx'
import {Disposers} from './lib/little-mst'

export const store = observable({
  counter: 0,
})

const disposers = Disposers(module)

export function startStoreReactions() {
  disposers.setInterval(() => {
    store.counter++
  }, 0)
}

export function stopStoreReactions() {
  disposers.dispose()
}
