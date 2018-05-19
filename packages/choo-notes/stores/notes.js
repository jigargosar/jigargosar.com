const R = require('ramda')
const faker = require('faker')
faker.seed(123)

module.exports = store

function createFakeNote({modifiedAt} = {}) {
  return {
    title: faker.lorem.words(),
    body: faker.lorem.text(),
    modifiedAt: modifiedAt || faker.date.recent(),
  }
}

const fakeNotes = R.times(createFakeNote, 15)

function store(state, emitter) {
  state.notes = {
    list: fakeNotes,
  }

  emitter.on('DOMContentLoaded', function() {
    emitter.on('notes:add', function() {
      state.notes.list.push(createFakeNote({modifiedAt: Date.now()}))
      emitter.emit(state.events.RENDER)
    })
  })
}
