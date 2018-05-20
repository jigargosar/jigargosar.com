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
  const viewMachine = Machine({
    key: 'notesViewState',
    initial: 'list',
    strict: true,
    states: {
      list: {
        on: {
          addNew: {
            editing: {
              actions: [],
            },
          },
          editExisting: {
            editing: {
              actions: ['updateNoteAtIndex'],
            },
          },
        },
      },
      editing: {
        on: {
          save: 'list',
          cancel: 'list',
        },
      },
      stop: {},
    },
  })

  state.notes = {
    list: fakeNotes,
    viewMachine: viewMachine,
    currentState: viewMachine.initialState,
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
      state.notes.currentState = viewMachine.transition(
        state.notes.currentState,
        {type: 'editExisting', idx},
      )
      const actionMap = {
        updateNoteAtIndex: function() {
          state.notes.editing = {idx}
          state.notes.list = R.update(
            idx,
            createFakeNote({modifiedAt: Date.now()}),
          )(state.notes.list)
        },
      }

      R.forEach(action =>
        R.propOr(R.T, action, actionMap)(),
      )(state.notes.currentState.actions)

      render()
    })
  })
}
