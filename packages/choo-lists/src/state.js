const R = require('ramda')
const RA = require('ramda-adjunct')
const G = require('./models/grain')

export function getGrainsList(state) {
  // return state.grains.list
  return state.grains.grainsStore.getList()
}

export const findGrainEqById = R.curry(function findGrainEqById(grain, state) {
  return R.compose(R.find(G.eqById(grain)), getGrainsList)(state)
})

export const isGrainEqByIdNotNil = R.curry(function isGrainEqByIdNotNil(
  grain,
  state,
) {
  return R.compose(RA.isNotNil, findGrainEqById(grain))(state)
})

export function grainsPD(state) {
  // return R.when(R.isEmpty, () => pouchDBGrainsList(state))(
  //   firebaseGrainsList(state),
  // )
  return state.grains.listPD
}
