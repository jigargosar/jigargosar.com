import {autobind} from './lib/little-react'
import {
  computed,
  isComputed,
  isComputedProp,
  observable,
  toJS,
} from './lib/mobx'
import {Disposers} from './lib/little-mobx'
import {prettyJSONStringify} from './lib/little-ramda'

const Store = class Store {
  @observable title = 'One Do'
  constructor() {
    Object.defineProperties(this, {
      disposers: {
        value: Disposers(module),
      },
      toJSON: {
        value: computed(() => prettyJSONStringify(this.toJS)),
      },
    })
  }

  get toJS() {
    return toJS(this)
  }
  // get toJSForLS() {
  //   return pick(['title'], toJS(this))
  // }
}

autobind(Store)

export const store = new Store()

function logIsComputedProp(propName) {
  console.log(
    `isComputedProp(store,${propName})`,
    isComputedProp(store, propName),
  )
}

logIsComputedProp('toJS')
logIsComputedProp('toJSON')

console.log(`isComputed(store.toJSON)`, isComputed(store.toJSON))
