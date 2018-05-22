module.exports = store;

function store(state, emitter) {
  state.list = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

  emitter.on("DOMContentLoaded", function() {
    emitter.on("clicks:add", function(count) {
      state.totalClicks += count;
      emitter.emit(state.events.RENDER);
    });
  });
}
