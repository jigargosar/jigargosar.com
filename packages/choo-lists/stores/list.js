const assert = require('assert')
const R = require('ramda')
const log = require('nanologger')('stores:list')
const G = require('../models/grain')
const EM = require('../models/edit-mode')
const yaml = require('js-yaml')

const listStorageKey = 'choo-list:list'
const viewStateStorageKey = 'choo-list:view'

module.exports = store

function store(state, emitter) {
  state.list = R.times(() => G.createNew(), 10)
  state.editMode = EM.idle

  state.events.list_add = 'list:add'
  state.events.list_edit = 'list:edit'
  state.events.list_edit_onTextChanged = 'list:edit:onTextChange'
  state.events.list_edit_onYAMLUpdate = 'list:edit:onYAMLUpdate'
  state.events.list_edit_discard = 'list:edit:discard'
  state.events.list_edit_save = 'list:edit:save'
  state.events.list_delete = 'list:delete'

  emitter.on('DOMContentLoaded', function() {
    state.list.splice(
      0,
      state.list.length,
      ...R.defaultTo([], JSON.parse(localStorage.getItem(listStorageKey))),
    )

    Object.assign(
      state,
      getViewState(
        R.defaultTo(
          {editMode: EM.idle},
          JSON.parse(localStorage.getItem(viewStateStorageKey)),
        ),
      ),
    )

    log.debug('state.list: after load', state.list)

    emitter.emit(state.events.RENDER)
    emitter.on(state.events.list_add, function() {
      const newGrainText = prompt('New Grain', 'Get Milk!')
      log.debug('newGrainText', newGrainText)
      if (R.isNil(newGrainText)) return
      state.list.unshift(G.createNew({text: newGrainText}))
      emitter.emit(state.events.RENDER)
      persistList()
    })

    function dumpYAML(obj) {
      return yaml.dump(obj, {noCompatMode: true, lineWidth: 60})
    }

    emitter.on(state.events.list_edit, function(grain) {
      assert(state.editMode === EM.idle)
      assert(R.isNil(state.editState))
      state.editMode = EM.editing
      state.editState = {
        grainId: G.id(grain),
        form: R.clone(grain),
        yaml: dumpYAML(grain),
      }
      persistViewState()
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.list_edit_onTextChanged, function(text) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editState.form.text = text
      state.editState.yaml = dumpYAML(
        R.merge(state.editState.form, {text: R.trim(text)}),
      )

      persistViewState()
      emitter.emit(state.events.RENDER)
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
        emitter.emit(state.events.RENDER)
      }
    })

    emitter.on(state.events.list_edit_discard, function() {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editMode = EM.idle
      state.editState = null
      persistViewState()
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.list_edit_save, function() {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))

      const grain = R.find(R.propEq('id', state.editState.grainId), state.list)
      assert(!R.isNil(grain))
      state.list.splice(
        R.indexOf(grain),
        1,
        G.updateText(state.editState.form.text, grain),
      )

      state.editMode = EM.idle
      state.editState = null
      persistViewState()
      emitter.emit(state.events.RENDER)

      persistList()
    })

    emitter.on(state.events.list_delete, function(grain) {
      const idx = R.indexOf(grain, state.list)
      state.list.splice(idx, 1)
      emitter.emit(state.events.RENDER)
      persistList()
    })

    function persistViewState() {
      const serialisedViewState = JSON.stringify(getViewState(state), null, 2)
      log.debug('serialisedViewState', serialisedViewState)
      localStorage.setItem(viewStateStorageKey, serialisedViewState)
    }

    function getViewState(state) {
      return R.pick(['editState', 'editMode'], state)
    }

    function persistList() {
      const serialisedList = JSON.stringify(state.list, null, 2)
      log.debug('serialisedList', serialisedList)
      localStorage.setItem(listStorageKey, serialisedList)
    }
  })
}
