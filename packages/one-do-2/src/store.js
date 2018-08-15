import {autobind} from './lib/little-react'
import {observable, toJS} from './lib/mobx'
import {Disposers} from './lib/little-mobx'
import {pick} from './lib/ramda'
import {prettyJSONStringify} from './lib/little-ramda'

@autobind
class Store {
  @observable title = 'One Do'
  disposers = Disposers(module)

  get toJSON() {
    return prettyJSONStringify(this.toJS)
  }
  get toJS() {
    return toJS(this)
  }
  get toJSForLS() {
    return pick(['title'], toJS(this))
  }
}

export const store = new Store()
