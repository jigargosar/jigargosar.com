const R = require('ramda')
const faker = new (require('faker'))(123)
const chance = new (require('chance'))(123)

module.exports = store

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
