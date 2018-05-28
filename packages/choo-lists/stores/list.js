const assert = require('assert')
const R = require('ramda')
const RA = require('ramda-adjunct')
const log = require('nanologger')('stores:list')
const G = require('../models/grain')
const EM = require('../models/edit-mode')
const yaml = require('js-yaml')
const LocalStorageItem = require('./local-storage-item')
const PD = require('../models/pouch-db')

const viewLS = LocalStorageItem('choo-list:view', {editMode: EM.idle})

module.exports = store

function store(state, emitter) {
  state.list = R.times(() => G.createNew(), 10)
  state.editMode = EM.idle

  state.events.list_edit = 'list:edit'
  state.events.list_edit_onTextChanged = 'list:edit:onTextChange'
  state.events.list_edit_onYAMLUpdate = 'list:edit:onYAMLUpdate'
  state.events.list_edit_discard = 'list:edit:discard'
  state.events.list_edit_save = 'list:edit:save'

  function emitRender() {
    emitter.emit(state.events.RENDER)
  }

  emitter.on('DOMContentLoaded', function() {
    const listPD = PD('choo-list:list')

    Object.assign(state, pickViewState(viewLS.load()))

    function dumpYAML(obj) {
      return yaml.dump(obj, {noCompatMode: true, lineWidth: 60})
    }

    emitter.on(state.events.list_edit, function(grain) {
      assert(state.editMode === EM.idle)
      assert(R.isNil(state.editState))
      state.editMode = EM.editing
      state.editState = {
        grainId: G.getId(grain),
        form: R.clone(grain),
        yaml: dumpYAML(grain),
      }
      persistViewState()
      emitRender()
    })

    emitter.on(state.events.list_edit_onTextChanged, function(text) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editState.form.text = text
      state.editState.yaml = dumpYAML(
        R.merge(state.editState.form, {text: R.trim(text)}),
      )

      persistViewState()
      emitRender()
    })

    emitter.on(state.events.list_edit_onYAMLUpdate, function(yamlString) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))

      state.editState.yaml = yamlString

      const parseYAMLForm = R.compose(
        R.pick(['text']),
        R.tryCatch(yaml.safeLoad, R.always({})),
      )
      const updatedForm = parseYAMLForm(yamlString)
      if (!R.isEmpty(updatedForm)) {
        Object.assign(state.editState.form, updatedForm)
        persistViewState()
        emitRender()
      }
    })

    emitter.on(state.events.list_edit_discard, function() {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editMode = EM.idle
      state.editState = null
      persistViewState()
      emitRender()
    })

    emitter.on(state.events.list_edit_save, function() {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))

      const grain = R.find(G.idEq(state.editState.grainId), state.list)
      assert(RA.isNotNil(grain))

      const updatedGrain = G.setText(state.editState.form.text, grain)
      listPD.update(updatedGrain).then(doc => {
        state.list.splice(R.indexOf(grain, state.list), 1, doc)

        state.editMode = EM.idle
        state.editState = null
        persistViewState()
        emitRender()
      })
    })

    function persistViewState() {
      viewLS.save(pickViewState(state))
    }

    function pickViewState(state) {
      return R.pick(['editState', 'editMode'], state)
    }
  })
}
