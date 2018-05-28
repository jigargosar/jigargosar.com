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

function pickViewState(store) {
  return R.pick(['editState', 'editMode'], store)
}

function persistViewState(store) {
  viewLS.save(pickViewState(store))
}

function dumpYAML(obj) {
  return yaml.dump(obj, {noCompatMode: true, lineWidth: 60})
}

module.exports = createStore({
  storeName: 'editGrain',
  initialState: {editMode: EM.idle},
  events: {
    DOMContentLoaded: ({store, actions: {render}}) => {
      Object.assign(pickViewState(viewLS.load()))
      render()
    },
    edit: ({data: {grain}, store, actions: {render}}) => {
      assert(store.editMode === EM.idle)
      assert(R.isNil(store.editState))
      G.validate(grain)
      store.editMode = EM.editing
      store.editState = {
        grainId: G.getId(grain),
        form: R.clone(grain),
        yaml: dumpYAML(grain),
      }
      persistViewState(store)
      render()
    },
    textChange: function({data: {text}, store, actions: {render}}) {
      assert(store.editMode === EM.editing)
      assert(!R.isNil(store.editState))
      store.editState.form.text = text
      store.editState.yaml = dumpYAML(
        R.merge(store.editState.form, {text: R.trim(text)}),
      )
      persistViewState(store)
      render()
    },
    yamlChange: function({data, store, actions: {render}}) {
      assert(store.editMode === EM.editing)
      assert(!R.isNil(store.editState))

      store.editState.yaml = data.yamlString

      const parseYAMLForm = R.compose(
        R.pick(['text']),
        R.tryCatch(yaml.safeLoad, R.always({})),
      )
      const updatedForm = parseYAMLForm(data.yamlString)
      if (!R.isEmpty(updatedForm)) {
        Object.assign(store.editState.form, updatedForm)
        persistViewState(store)
        render()
      }
    },

    discard: function({store, actions: {render}}) {
      assert(store.editMode === EM.editing)
      assert(!R.isNil(store.editState))
      store.editMode = EM.idle
      store.editState = null
      persistViewState(store)
      render()
    },

    save: function({data, store, actions: {render}}) {
      assert(store.editMode === EM.editing)
      assert(!R.isNil(store.editState))
      GA.update({
        _id: store.editState.grainId,
        text: store.editState.form.text,
      })

      store.editMode = EM.idle
      store.editState = null
      persistViewState(store)
      render()
    },
  },
})

module.exports.storeName = 'editGrain'
