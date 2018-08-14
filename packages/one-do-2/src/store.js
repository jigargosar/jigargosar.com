import {observable} from 'mobx'
import {Disposers} from './lib/little-mst'

export const store = observable({
  counter: 0,
})

const disposers = Disposers(module)

export function startStoreReactions() {
  disposers.dispose()
  disposers.setInterval(() => {
    store.counter++
  }, 1000)
}

export function stopStoreReactions() {
  disposers.dispose()
}
