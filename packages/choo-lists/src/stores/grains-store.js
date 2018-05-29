const R = require('ramda')
const RA = require('ramda-adjunct')
const G = require('../models/grain')
const createStore = require('./createStore')
const log = require('nanologger')('grains-store')
const PD = require('../models/pouch-db')
const assert = require('assert')
const {actions: FA} = require('./firebase-store')

module.exports = createStore({
  namespace: 'grains',
  initialState: {
    listPD: PD('choo-list:list'),
    list: [],
  },
  events: {
    DOMContentLoaded: ({store: {listPD, list}, actions: {render}}) => {
      listPD
        .fetchDocsDescending()
        .then(R.map(G.validate))
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
              const idx = R.findIndex(G.eqById(doc), list)
              if (change.deleted) {
                assert(idx !== -1)
                list.splice(idx, 1)
              }else if(idx === -1){
                list.unshift(doc)
              }else{
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
    delete: ({store: {listPD, list}, data: {grain}, actions: {render}}) => {
      listPD.remove(grain)
    },

    update: ({data, store: {listPD, list}, actions: {render}}) => {
      const grain = R.find(G.eqById(data), list)
      assert(RA.isNotNil(grain))
      listPD.update(G.setText(data.text, grain))
    },

    updateFromRemote: ({data, store: {listPD}}) => {
      assert(G.idEq(data.id, data.doc))
      const grain = G.validate(data.doc)
      if (G.isLocal(grain)) {
        return
      }
      debugger
      listPD._db
        .put(data.doc)
        .then(res => {
          log.info('remote result', res)
        })
        .catch(error => {
          log.info('remote error', error)
          listPD._db
            .allDocs({
              keys: [data.id],
              include_docs: true,
            })
            .then(res => log.info('get after error', res))
        })

      // R.cond([
      //   [
      //     R.propEq('type', 'added'),
      //     ({doc}) => {
      //       listPD._db.txn(
      //         {id: data.id, create: true, timestamps: true},
      //         (doc, to_txn) => {
      //           Object.assign(doc, data.doc)
      //           return to_txn()
      //         },
      //         function(er, doc) {
      //           if (er) console.log('Problem creating my_doc: ' + er)
      //           else
      //             console.log(
      //               'Document created ' +
      //                 doc.created_at +
      //                 ' count = ' +
      //                 doc.count,
      //             )
      //         },
      //       )
      //     },
      //   ],
      // ])(data)
    },
  },
})
