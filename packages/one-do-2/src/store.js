import {autobind} from './lib/little-react'
import {
  computed,
  decorate,
  isComputed,
  isComputedProp,
  observable,
  spy,
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
        get() {
          return prettyJSONStringify(this.toJS)
        },
        configurable: true,
      },
      toJS: {
        get() {
          return toJS(this)
        },
        configurable: true,
      },
    })
  }

  // get toJSForLS() {
  //   return pick(['title'], toJS(this))
  // }
}

autobind(Store)

export const store = new Store()

decorate(store, {
  toJS: computed,
  toJSON: computed,
})

logIsComputedProp('toJS')

logIsComputedProp('toJSON')
//
spy(change => {
  console.log(`change`, change)
})

console.debug(`isComputed(store.toJSON)`, isComputed(store.toJSON))

function logIsComputedProp(propName) {
  console.log(
    `isComputedProp(store,${propName})`,
    isComputedProp(store, propName),
  )
}
