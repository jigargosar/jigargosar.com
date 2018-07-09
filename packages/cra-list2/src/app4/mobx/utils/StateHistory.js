import {mJS, mReaction, oArray} from '../little-mobx'

export function createObservableHistory(obs) {
  const historyList = oArray([mJS(obs)], {name: 'historyList'})

  mReaction(
    () => mJS(obs),
    newState => {
      historyList.push(newState)
      console.debug(`historyList.length`, historyList.length)
    },
    {name: 'StateHistory'},
  )

  return historyList
}
// mSpy(change => {
//   if (change.spyReportStart) {
//     console.groupCollapsed(change.type, change.name)
//     console.log(`change`, change)
//   } else if (change.spyReportEnd) {
//     console.groupEnd()
//     // count -= 1
//   } else {
//     console.log(`change`, change)
//   }
// })
