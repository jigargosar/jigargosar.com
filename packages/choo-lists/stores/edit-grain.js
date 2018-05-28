const R = require('ramda')
const RA = require('ramda-adjunct')
const G = require('../models/grain')
const EM = require('../models/edit-mode')
const yaml = require('js-yaml')
const LocalStorageItem = require('./local-storage-item')
const {actions: GA} = require('../stores/grains')

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
    textChange: function({data: {text}, state, actions: {render}}) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editState.form.text = text
      state.editState.yaml = dumpYAML(
        R.merge(state.editState.form, {text: R.trim(text)}),
      )
      persistViewState(state)
      render()
    },
    yamlChange: function({data, state, actions: {render}}) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))

      state.editState.yaml = data.yamlString

      const parseYAMLForm = R.compose(
        R.pick(['text']),
        R.tryCatch(yaml.safeLoad, R.always({})),
      )
      const updatedForm = parseYAMLForm(data.yamlString)
      if (!R.isEmpty(updatedForm)) {
        Object.assign(state.editState.form, updatedForm)
        persistViewState(state)
        render()
      }
    },

    discard: function({state, actions: {render}}) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editMode = EM.idle
      state.editState = null
      persistViewState(state)
      render()
    },

    save: function({data, state, actions: {render}}) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      GA.update({
        _id: state.editState.grainId,
        text: state.editState.form.text,
      })

      state.editMode = EM.idle
      state.editState = null
      persistViewState(state)
      render()
    },
  },
})

module.exports.storeName = 'grains'
