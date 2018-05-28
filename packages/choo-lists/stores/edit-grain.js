const R = require('ramda')
const RA = require('ramda-adjunct')
const G = require('../models/grain')
const EM = require('../models/edit-mode')
const yaml = require('js-yaml')
const LocalStorageItem = require('./local-storage-item')

var createStore = require('../createStore')
const log = require('nanologger')('stores:edit-grain')
const assert = require('assert')

const viewLS = LocalStorageItem('choo-list:view', {editMode: EM.idle})

function pickViewState(state) {
  return R.pick(['editState', 'editMode'], state)
}

function persistViewState(state) {
  viewLS.save(pickViewState(state))
}

function dumpYAML(obj) {
  return yaml.dump(obj, {noCompatMode: true, lineWidth: 60})
}

module.exports = createStore({
  storeName: 'edit-grain',
  initialState: {editMode: EM.idle},
  events: {
    DOMContentLoaded: ({store, state, actions: {render}}) => {
      Object.assign(state, pickViewState(viewLS.load()))
      render()
    },
    edit: ({data: {grain}, store, state, actions: {render}}) => {
      assert(state.editMode === EM.idle)
      assert(R.isNil(state.editState))
      G.validate(grain)
      state.editMode = EM.editing
      state.editState = {
        grainId: G.getId(grain),
        form: R.clone(grain),
        yaml: dumpYAML(grain),
      }
      persistViewState(state)
      render()
    },
  },
})

module.exports.storeName = 'grains'
