const Machine = require('xstate').Machine
const R = require('ramda')
const faker = require('faker')
const assert = require('assert')
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

const viewMachine = Machine({
  key: 'notesViewState',
  initial: 'list',
  strict: true,
  states: {
    list: {
      on: {
        addClicked: {
          editing: {
            actions: ['addNewNote'],
          },
        },
        editClicked: {
          editing: {
            actions: ['startEditingNote'],
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

const performAction = R.curry((actionMap, event, actionName) =>
  R.propOr(R.T, actionName, actionMap)(event),
)

function store(state, emitter) {
  const notes = {
    list: fakeNotes,
    editing: null,
    viewMachine: viewMachine,
    viewState: viewMachine.initialState,
  }

  state.notes = notes

  function render() {
    emitter.emit(state.events.RENDER)
  }

  const actionMap = {
    startEditingNote: function({idx}) {
      assert(idx >= 0)
      assert(idx < notes.list.length)
      const note = notes.list[idx]
      notes.editing = {
        idx,
        note,
        isDirty: false,
        fields: R.pick(['title', 'body'])(note),
      }
      // notes.list = R.update(idx, createFakeNote({modifiedAt: Date.now()}))(
      //   notes.list,
      // )
    },
  }

  emitter.on('DOMContentLoaded', () => {
    emitter.on('notes:add', () => {
      notes.list = R.prepend(createFakeNote({modifiedAt: Date.now()}))(
        notes.list,
      )
      render()
    })
    emitter.on('notes:edit', idx => {
      const event = {
        type: 'editClicked',
        idx,
      }
      const nextViewState = viewMachine.transition(notes.viewState.value, event)

      assert.notEqual(
        notes.viewState.value,
        nextViewState.value,
        `Action 'notes:edit', Transition failed for event ${event}`,
      )
      notes.viewState = nextViewState
      notes.viewState.actions.forEach(performAction(actionMap, event))

      render()
    })

    emitter.emit('notes:edit', 2)
  })
}
