const R = require('ramda')
const log = require('nanologger')('store:main')

module.exports = store

function store(state, emitter) {
  state.list = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']
  state.events.list_add = 'list:add'
  state.events.list_delete = 'list:delete'
  emitter.on('DOMContentLoaded', function() {
    const eventMap = {
      [state.events.list_add]: function(text) {
        state.list.prepend(text)
      },
      [state.events.list_delete]: function(idx) {
        state.list.splice(idx, 1)
      },
    }

    R.forEachObjIndexed((fn, name) => emitter.on(name, fn))(eventMap)
  })
}
