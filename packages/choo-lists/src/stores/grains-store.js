import {findGrainEqById, isGrainEqByIdNotNil} from '../state'
import {GrainsStore} from '../mst-models/grains-store'

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

module.exports = createStore({
  namespace: 'grains',
  initialState: {
    listPD: PD('choo-list:list'),
    list: [],
    grainsStore: GrainsStore.create(),
  },
  events: {
    DOMContentLoaded: ({
      store: {listPD, list, grainsStore},
      actions: {render},
    }) => {
      listPD
        .fetchDocsDescending()
        .then(R.map(G.validate))
        .then(R.tap(grainsStore.putAll))
        .then(grains => list.splice(0, list.length, ...grains))
        .then(render)
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
              const idx = R.findIndex(G.eqById(doc), list)
              if (change.deleted) {
                assert(idx !== -1)
                list.splice(idx, 1)
              } else if (idx === -1) {
                list.unshift(doc)
              } else {
                list.splice(idx, 1, doc)
              }
              render()
            })
        })
    },
    add: ({store: {listPD, list}, actions: {render}}) => {
      const newGrainText = prompt('New Grain', 'Get Milk!')
      log.debug('newGrainText', newGrainText)
      if (R.isNil(newGrainText)) return
      listPD.insert(G.createNew({text: newGrainText}))
    },
    delete: ({store: {listPD, list}, data, actions: {render}}) => {
      const grain = R.find(G.eqById(data.grain), list)
      assert(RA.isNotNil(grain))
      listPD.update(G.setDeleted(grain))
    },

    update: ({data, store: {listPD, list}, actions: {render}}) => {
      const grain = R.find(G.eqById(data), list)
      assert(RA.isNotNil(grain))
      listPD.update(G.setText(data.text, grain))
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
          return listPD._put(R.omit(['_rev'], remoteGrain))
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
            listPD._put(R.merge(remoteGrain, R.pick(['_rev'], row.doc)))
          }
        })
        .catch(logError)
    },
  },
})
