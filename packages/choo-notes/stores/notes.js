var R = require('ramda')

module.exports = store
var faker = require('faker')
var Chance = require('chance')

var chance = new Chance(123)

function createFakeNote() {
  return {
    text: faker.lorem.paragraphs(),
  }
}

const fakeNotes = R.times(
  createFakeNote,
  chance.natural({
    min: 3,
    max: 10,
  }),
)

function store(state, emitter) {
  state.notes = {
    list: fakeNotes,
  }

  emitter.on('DOMContentLoaded', function() {
    emitter.on('notes:add', function() {
      state.notes.list.push(createFakeNote())
      emitter.emit(state.events.RENDER)
    })
  })
}
