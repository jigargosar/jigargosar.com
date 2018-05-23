const assert = require('assert')
const R = require('ramda')
const log = require('nanologger')('store:main')
const I = require('../models/item')
const EM = require('../models/edit-mode')

module.exports = store

function store(state, emitter) {
  state.list = R.times(() => I.createNew(), 10)
  state.editMode = EM.idle

  state.events.list_add = 'list:add'
  state.events.list_edit = 'list:edit'
  state.events.list_delete = 'list:delete'

  emitter.on('DOMContentLoaded', function() {
    emitter.on(state.events.list_add, function(item) {
      state.list.unshift(item)
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.list_edit, function(item) {
      assert(state.editMode === EM.idle)
      assert(R.isNil(state.editState))
      state.editMode = EM.editing
      state.editState = {item}
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.list_delete, function(item) {
      const idx = R.indexOf(item, state.list)
      state.list.splice(idx, 1)
      emitter.emit(state.events.RENDER)
    })
  })
}
