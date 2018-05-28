const R = require('ramda')
const RA = require('ramda-adjunct')
const G = require('../models/grain')

var createStore = require('../createStore')
const log = require('nanologger')('stores:grains')
const PD = require('../models/pouch-db')
const assert = require('assert')

module.exports = createStore({
  storeName: 'grains',
  initialState: {
    listPD: PD('choo-list:list'),
    list: R.times(() => G.createNew(), 10),
  },
  events: {
    DOMContentLoaded: ({store: {listPD, list}, actions: {render}}) => {
      listPD
        .fetchDocsDescending()
        .then(
          R.compose(
            R.tap(grains => log.debug('load', ...grains)),
            R.map(R.compose(G.validate, R.prop('doc'))),
            R.tap(rows => log.trace('allDocs:rows', ...rows)),
            R.prop('rows'),
            R.tap(res => log.trace('allDocs:res', res)),
          ),
        )
        .then(grains => list.splice(0, list.length, ...grains))
        .then(render)
    },
    add: ({store: {listPD, list}, actions: {render}}) => {
      const newGrainText = prompt('New Grain', 'Get Milk!')
      log.debug('newGrainText', newGrainText)
      if (R.isNil(newGrainText)) return
      const newGrain = G.createNew({text: newGrainText})
      listPD.insert(newGrain).then(grain => {
        list.unshift(grain)
        render()
      })
    },
    delete: ({store: {listPD, list}, data: {grain}, actions: {render}}) => {
      listPD.remove(grain).then(doc => {
        const idx = R.findIndex(G.eqById(doc), list)
        assert(idx !== -1)
        list.splice(idx, 1)
        render()
      })
    },

    update: ({data, store: {listPD, list}, actions: {render}}) => {
      const grain = R.find(G.eqById(data), list)
      assert(RA.isNotNil(grain))

      const updatedGrain = G.setText(data.text, grain)
      listPD.update(updatedGrain).then(doc => {
        list.splice(R.indexOf(grain, list), 1, doc)
        render()
      })
    },
  },
})

module.exports.storeName = 'grains'
