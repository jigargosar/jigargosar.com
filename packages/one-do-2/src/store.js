import {observable} from './lib/little-mst'
import {autobind} from './lib/little-react'
import {toJS} from './lib/mobx'
import {Disposers} from './lib/little-mobx'

@autobind
class Store {
  @observable title = 'One Do'

  get asJSON() {
    return JSON.stringify(toJS(this), null, 2)
  }
}

export const store = new Store()

const disposers = Disposers(module)
