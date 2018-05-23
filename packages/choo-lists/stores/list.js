const R = require('ramda')
const log = require('nanologger')('store:main')
const I = require('../models/item')

module.exports = store

function store(state, emitter) {
  state.list = R.times(() => I.createNew(), 10)
  state.events.list_add = 'list:add'
  state.events.list_delete = 'list:delete'

  emitter.on('DOMContentLoaded', function() {
    emitter.on(state.events.list_add, function(item) {
      state.list.unshift(item)
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.list_delete, function(item) {
      const idx = R.indexOf(item, state.list)
      state.list.splice(idx, 1)
      emitter.emit(state.events.RENDER)
    })
  })
}
