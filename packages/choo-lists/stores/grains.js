const R = require('ramda')
const RA = require('ramda-adjunct')
const G = require('../models/grain')
const EM = require('../models/edit-mode')
const yaml = require('js-yaml')
const LocalStorageItem = require('./local-storage-item')

var createStore = require('../createStore')
const log = require('nanologger')('stores:grains')
const PD = require('../models/pouch-db')

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
  storeName: 'grains',
  initialState: {
    listPD: PD('choo-list:list'),
    list: R.times(() => G.createNew(), 10),
  },
  events: {
    DOMContentLoaded: ({store, emitter, actions, state}) => {
      store.listPD
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
        .then(grains => state.list.splice(0, state.list.length, ...grains))
        .then(() => actions.render())
    },
    add: ({store, emitter, state, actions}) => {
      const newGrainText = prompt('New Grain', 'Get Milk!')
      log.debug('newGrainText', newGrainText)
      if (R.isNil(newGrainText)) return
      const newGrain = G.createNew({text: newGrainText})
      store.listPD.insert(newGrain).then(grain => {
        state.list.unshift(grain)
        actions.render()
      })
    },
    edit: ({data: {grain}, store, emitter, state, actions}) => {
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
      actions.render()
    },
    delete: ({store: {listPD}, data: {grain}, actions: {render}}) => {
      listPD.remove(grain).then(doc => {
        const idx = R.findIndex(G.eqById(doc), state.list)
        assert(idx !== -1)
        state.list.splice(idx, 1)
        render()
      })
    },
  },
})

module.exports.storeName = 'grains'
