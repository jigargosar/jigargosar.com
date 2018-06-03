import {findGrainEqById, isGrainEqByIdNotNil} from '../state'
import {Grain} from '../mst-models/grains-store'
import {getSnapshot} from 'mobx-state-tree'
import {reaction} from 'mobx'
import {getAppActorId} from './actor-id'

const R = require('ramda')
const RA = require('ramda-adjunct')
const G = require('../models/grain')
const createStore = require('./createStore')
const log = require('nanologger')('pdb-grains-store')
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

module.exports = createStore({
  namespace: 'grains',
  initialState: {
    listPD: PD('choo-list:list'),
    list: [],
  },
  events: {
    DOMContentLoaded: ({
      store: {listPD, list, grainsStore},
      actions: {render},
    }) => {
      reaction(() => getSnapshot(grainsStore), render)

      listPD
        .fetchDocsDescending()
        .then(R.map(G.validate))
        .then(R.tap(grainsStore.putAll))
        // .then(grains => list.splice(0, list.length, ...grains))
        // .then(render)
        .then(() => {
          listPD._db
            .changes({
              include_docs: true,
              live: true,
              since: 'now',
            })
            .on('change', change => {
              const doc = G.validate(change.doc)
              grainsStore.put(doc)
              // const idx = R.findIndex(G.eqById(doc), list)
              // if (change.deleted) {
              //   assert(idx !== -1)
              //   list.splice(idx, 1)
              // } else if (idx === -1) {
              //   list.unshift(doc)
              // } else {
              //   list.splice(idx, 1, doc)
              // }
              // render()
            })
        })
    },
    add: ({store: {listPD, grainsStore}}) => {
      const newGrainText = prompt('New Grain', 'Get Milk!')
      log.debug('newGrainText', newGrainText)
      if (R.isNil(newGrainText)) return
      listPD.insert(toPDB(Grain.create({text: newGrainText})))
    },
    delete: ({store: {listPD, list, grainsStore}, data}) => {
      // const grain = R.find(G.eqById(data.id), list)
      // assert(RA.isNotNil(grain))
      // const deletedGrain = G.setDeleted(grain)
      listPD.update(toPDB(grainsStore.cloneById(data.id).markDeleted()))
    },

    update: ({data, store: {listPD, list, grainsStore}}) => {
      const grain = R.find(G.eqById(data), list)
      assert(RA.isNotNil(grain))
      const updatedGrain = G.setText(data.text, grain)
      // grainsStore.cloneById(G.getId(grain)).userPatchProps({text: data.text})
      listPD.update(updatedGrain)
    },

    updateFromRemote: ({data, store: {listPD}, state, actions}) => {
      assert(G.idEq(data.id, data.doc))
      const remoteGrain = G.validate(data.doc)
      if (isGrainEqByIdNotNil(remoteGrain, state) && G.isLocal(remoteGrain)) {
        return
      } else if (
        isGrainEqByIdNotNil(remoteGrain, state) &&
        G.getModifiedAt(remoteGrain) <
          G.getModifiedAt(findGrainEqById(remoteGrain, state))
      ) {
        return
      }
      const pdbGrainPromise = listPD._db.allDocs({
        keys: [G.getId(remoteGrain)],
        include_docs: true,
      })

      pdbGrainPromise
        .catch(e => {
          log.error(e)
          return listPD._pdPut(R.omit(['_rev'], remoteGrain))
        })
        .catch(logError)

      pdbGrainPromise
        .then(result => {
          const rows = result.rows
          assert.equal(rows.length, 1)
          const row = rows[0]

          const isRowDeleted = R.pathOr(false, 'value.deleted'.split('.'))
          if (isRowDeleted(row)) {
            log.info(
              'since docId is deleted locally, not adding it to either PDB or memory cache',
            )
          } else {
            listPD._pdPut(R.merge(remoteGrain, R.pick(['_rev'], row.doc)))
          }
        })
        .catch(logError)
    },
  },
})
