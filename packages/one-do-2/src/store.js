import {observable} from 'mobx'

export const store = observable({
  counter: 0,
})

export function startStoreReactions() {
  setInterval(() => {
    store.counter++
  }, 0)
}
