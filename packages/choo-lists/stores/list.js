const assert = require('assert')
const R = require('ramda')
const log = require('nanologger')('stores:list')
const GG = require('../models/grain')
const EM = require('../models/edit-mode')

const listStorageKey = 'choo-list:list'

module.exports = store

function store(state, emitter) {
  state.list = R.times(() => GG.createNew(), 10)
  state.editMode = EM.idle

  state.events.list_add = 'list:add'
  state.events.list_edit = 'list:edit'
  state.events.list_edit_onTextChanged = 'list:edit:onTextChange'
  state.events.list_edit_discard = 'list:edit:discard'
  state.events.list_edit_save = 'list:edit:save'
  state.events.list_delete = 'list:delete'

  emitter.on('DOMContentLoaded', function() {
    state.list = JSON.parse(
      R.defaultTo('[]', localStorage.getItem(listStorageKey)),
    )
    emitter.emit(state.events.RENDER)
    emitter.on(state.events.list_add, function() {
      const newGrainText = prompt('New GGrain', 'Grainet Milk!')
      log.debug('newGrainText', newGrainText)
      if (R.isNil(newGrainText)) return
      state.list.unshift(GG.createNew({text: newGrainText}))
      emitter.emit(state.events.RENDER)
      persistList()
    })

    emitter.on(state.events.list_edit, function(grain) {
      assert(state.editMode === EM.idle)
      assert(R.isNil(state.editState))
      state.editMode = EM.editing
      state.editState = {grain, form: {text: grain.text}}
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.list_edit_onTextChanged, function(text) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editState.form.text = text
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.list_edit_discard, function() {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editMode = EM.idle
      state.editState = null
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.list_edit_save, function() {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))

      const grain = state.editState.grain
      const idx = R.indexOf(grain, state.list)
      state.list.splice(idx, 1, GG.updateText(state.editState.form.text, grain))

      state.editMode = EM.idle
      state.editState = null
      emitter.emit(state.events.RENDER)

      persistList()
    })

    emitter.on(state.events.list_delete, function(grain) {
      const idx = R.indexOf(grain, state.list)
      state.list.splice(idx, 1)
      emitter.emit(state.events.RENDER)
      persistList()
    })

    function persistList() {
      const serialisedList = JSON.stringify(state.list, null, 2)
      log.debug('serialisedList', serialisedList)
      localStorage.setItem(listStorageKey, serialisedList)
    }
  })
}
