const R = require('ramda')
const RA = require('ramda-adjunct')
const EM = require('../models/edit-mode')
const yaml = require('js-yaml')
const LocalStorageItem = require('./local-storage-item')

var createStore = require('./createStore')
const log = require('nanologger')('edit-grain-store')
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
  namespace: 'editGrain',
  initialState: {editMode: EM.idle},
  events: {
    DOMContentLoaded: ({store, actions: {render}}) => {
      Object.assign(store, pickViewState(viewLS.load()))
      render()
    },
    persistAndRender: ({store, actions: {render}}) => {
      persistViewState(store)
      render()
    },
    edit: ({
      data: {grain},
      store,
      state,
      actions: {persistAndRender},
    }) => {
      assert(store.editMode === EM.idle)
      assert(R.isNil(store.editState))
      assert(RA.isNotNil(grain))
      store.editMode = EM.editing
      store.editState = {
        id: grain.getId(),
        revision: grain.getRevision(),
        form: R.clone(grain),
        yaml: dumpYAML(grain),
      }
      persistAndRender()
    },
    textChange: function({
      data: {text},
      store,
      actions: {persistAndRender},
    }) {
      assert(store.editMode === EM.editing)
      assert(!R.isNil(store.editState))
      store.editState.form.text = text
      store.editState.yaml = dumpYAML(
        R.merge(store.editState.form, {text: R.trim(text)}),
      )
      persistAndRender()
    },
    yamlChange: function({data, store, actions: {persistAndRender}}) {
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
        persistAndRender()
      }
    },

    discard: function({store, actions: {persistAndRender}}) {
      assert(store.editMode === EM.editing)
      assert(!R.isNil(store.editState))
      store.editMode = EM.idle
      store.editState = null
      persistAndRender()
    },

    save: function({
      data,
      store,
      state,
      actions: {persistAndRender},
    }) {
      assert(store.editMode === EM.editing)
      assert(!R.isNil(store.editState))
      state.grains
        .userUpdateForId(
          store.editState.id,
          store.editState.revision,
          R.pick(['text'], store.editState.form),
        )
        .then(() => {
          store.editMode = EM.idle
          store.editState = null
          persistAndRender()
        })
      // GA.update({
      //   _id: store.editState.grainId,
      //   text: store.editState.form.text,
      // })
    },
  },
})
