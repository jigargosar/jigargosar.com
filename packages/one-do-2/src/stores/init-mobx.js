import {configureMobx, Disposers} from '../lib/little-mobx'

configureMobx({computedRequiresReaction: true, enforceActions: true})

const disposers = Disposers(module)

disposers.spy(change => {
  // console.debug(`change`, change)
})

// disposers.spy(change => {
//   const {type} = change
//   // console.log(`type`, type)
//   if (['action'].includes(type)) {
//     console.log(`change`, change)
//   } else {
//     console.debug(`change`, change)
//   }
// })
//
