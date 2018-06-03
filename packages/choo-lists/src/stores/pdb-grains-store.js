import {getSnapshot} from 'mobx-state-tree'
import {reaction} from 'mobx'
import {getAppActorId} from './actor-id'
import {PDBGrainsCollection} from '../mst-models/pdb-grains-collection'

const R = require('ramda')
const RA = require('ramda-adjunct')
const G = require('../models/grain')
const createStore = require('./createStore')
const log = require('nanologger')('grains-store')
const PD = require('../models/pouch-db')
const assert = require('assert')
const {actions: FA} = require('./firebase-store')

function logError(e) {
  log.error(e)
  debugger
}

const toPDB = R.compose(
  R.merge(R.__, {actorId: getAppActorId()}),
  RA.renameKeys({id: '_id'}),
  getSnapshot,
)

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
