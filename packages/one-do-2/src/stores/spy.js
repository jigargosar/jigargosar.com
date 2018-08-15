import {Disposers} from '../lib/little-mobx'

const disposers = Disposers(module)

disposers.spy(change => {
  console.debug(`change`, change)
})
