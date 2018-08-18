import {configureMobx, Disposers} from '../lib/little-mobx'

configureMobx({computedRequiresReaction: true, enforceActions: 'strict'})

const disposers = Disposers(module)

disposers.spy(change => {
  // console.debug(`change`, change)
})

// enableLogging({
//   action: true,
//   // reaction: false,
//   // compute: false,
//   transaction: true,
//   // predicate: (...args) => {
//   //   console.log(`args`, ...args)
//   //   return true
//   // },
// })

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
