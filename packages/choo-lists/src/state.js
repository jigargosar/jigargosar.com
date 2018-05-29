const R = require('ramda')
const RA = require('ramda-adjunct')

export function grainsList(state) {
  // return R.when(R.isEmpty, () => pouchDBGrainsList(state))(
  //   firebaseGrainsList(state),
  // )
  return pouchDBGrainsList(state)
}

export function grainsPD(state) {
  // return R.when(R.isEmpty, () => pouchDBGrainsList(state))(
  //   firebaseGrainsList(state),
  // )
  return state.grains.listPD
}

function firebaseGrainsList(state) {
  return R.values(state.firebase.grainsLookup)
}

function pouchDBGrainsList(state) {
  return state.grains.list
}
