import {
  computed,
  isComputed,
  isComputedProp,
  observable,
  toJS,
} from './lib/mobx'
import {Disposers} from './lib/little-mobx'
import {prettyJSONStringify} from './lib/little-ramda'
import {pick} from './lib/ramda'
import {autobind} from './lib/autobind'

@autobind
class Store {
  @observable title = 'One Do'
  disposers = Disposers(module)

  @computed
  get toJSON() {
    return prettyJSONStringify(this.toJS)
  }

  @computed
  get toJS() {
    return toJS(this)
  }
  @computed
  get toJSForLS() {
    return pick(['title'], toJS(this))
  }
}

const store = observable(new Store())
export default store

logIsComputedProp('toJS')
logIsComputedProp('toJSON')

console.debug(`isComputed(store.toJSON)`, isComputed(store.toJSON))

function logIsComputedProp(propName) {
  console.log(
    `isComputedProp(store,${propName})`,
    isComputedProp(store, propName),
  )
}
