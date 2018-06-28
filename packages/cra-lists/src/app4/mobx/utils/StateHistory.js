import {mJS, mReaction, mSpy, oArray} from '../utils'

export function createObservableHistory(obs) {
  /*const historyList = oArray([mJS(obs)], {name: 'historyList'})

  mReaction(
    () => mJS(obs),
    newState => {
      historyList.push(newState)
      console.log(`historyList.length`, historyList.length)
    },
    {name: 'StateHistory'},
  )

  return historyList*/
}
let count = 0
let zeroEvent = null
mSpy(change => {
  if (change.spyReportStart) {
    if (count === 0) {
      zeroEvent = change
    }
    count += 1
  } else if (change.spyReportEnd) {
    count -= 1
  }

  if (count === 0) {
    console.log(`zeroEvent`, zeroEvent)
    console.log(`change`, change)
  }
  console.assert(count >= 0, 'count >=0')
})
