module.exports = store

function store (state, emitter) {
  state.totalClicks = 0
  state.events.clicks_add = 'clicks:add'
  emitter.on('DOMContentLoaded', function () {
    emitter.on(state.events.clicks_add, function (count) {
      state.totalClicks += count
      emitter.emit(state.events.RENDER)
    })
  })
}
