import {getSnapshot} from 'mobx-state-tree'
import {reaction} from 'mobx'
import {PDBGrainsCollection} from '../mst-models/pdb-grains-collection'

const R = require('ramda')
const RA = require('ramda-adjunct')
const createStore = require('./createStore')
const log = require('nanologger')('grains-store')
const assert = require('assert')

module.exports = function pdbGrainsStore(state, emitter, app) {
  const pdbGrainsCollection = PDBGrainsCollection.create()
  state.grains = pdbGrainsCollection

  emitter.on(state.events.DOMCONTENTLOADED, () => {
    reaction(
      () => getSnapshot(pdbGrainsCollection),
      () => emitter.emit(state.events.RENDER),
    )
  })
}
