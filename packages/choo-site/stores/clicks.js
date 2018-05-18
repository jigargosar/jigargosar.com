import * as R from "ramda"

module.exports = store

function addEvents(state, ns, eventNames) {
  state.events[ns] =
      R.reduce((acc,
                   name) => Object.assign(acc, {[name]: `clicks.${name}`}), {},)(eventNames)
}

function store(state, emitter) {
  const eventNames = ["add"]
  addEvents(state, "clicks", eventNames)

  state.clicks = {total: 0}

  emitter.on("DOMContentLoaded", function () {
    emitter.on(state.events.clicks.add, function (count) {
      state.clicks.total += count
      emitter.emit(state.events.RENDER)
    })
  })
}
