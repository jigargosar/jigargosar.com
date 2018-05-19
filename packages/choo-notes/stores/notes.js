const Machine = require('xstate').Machine
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
    viewMachine: Machine({
      key: 'notesViewState',
      initial: 'list',
      states: {
        list: {
          on: {
            addNew: 'editNew',
            editExisting: 'editExisting',
          },
        },
        editNew: {
          on: {
            save: 'list',
            cancel: 'list',
          },
        },
        editExisting: {
          on: {
            save: 'list',
            cancel: 'list',
          },
        },
        stop: {},
      },
    }),
  }

  function render() {
    emitter.emit(state.events.RENDER)
  }

  emitter.on('DOMContentLoaded', function() {
    emitter.on('notes:add', function() {
      state.notes.list.unshift(createFakeNote({modifiedAt: Date.now()}))
      render()
    })

    emitter.on('notes:edit', function(idx) {
      state.notes.list = R.update(
        idx,
        createFakeNote({modifiedAt: Date.now()}),
      )(state.notes.list)
      state.notes.viewMachine.transition(
        state.notes.viewMachine.state,
        'editExisting',
      )
      render()
    })
  })
}
