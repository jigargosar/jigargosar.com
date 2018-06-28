import {mJS, mReaction, oArray} from '../utils'

export function createObservableHistory(obs) {
  const historyList = oArray([mJS(obs)], {name: 'historyList'})

  mReaction(
    () => mJS(obs),
    newState => {
      historyList.push(newState)
      console.log(`historyList.length`, historyList.length)
    },
    {name: 'StateHistory'},
  )

  return historyList
}
