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

const initialStateValue = 'list'

const viewMachine = Machine({
  key: 'notesViewState',
  initial: initialStateValue,
  strict: true,
  states: {
    [initialStateValue]: {
      on: {
        add: {
          editing: {
            actions: ['addNewNote'],
          },
        },
        edit: {
          editing: {
            actions: ['startEditingNote'],
          },
        },
      },
    },
    editing: {
      on: {
        save: {
          [initialStateValue]: {
            actions: ['saveEditingNote'],
          },
        },
        discard: {
          [initialStateValue]: {
            actions: ['cleanEditingState'],
          },
        },
      },
    },
    stop: {},
  },
})

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
    addNewNote: function() {
      assert(R.isNil(notes.editing))
      // const note = createFakeNote()
      notes.editing = {isNew: true, fields: {title: '', body: ''}}
    },
    startEditingNote: function({idx}) {
      assert(idx >= 0)
      assert(idx < notes.list.length)
      assert(R.isNil(notes.editing))

      const note = notes.list[idx]
      notes.editing = {
        idx,
        isNew: false,
        fields: R.pick(['title', 'body'])(note),
      }
    },
    cleanEditingState: function() {
      assert(!R.isNil(notes.editing))
      notes.editing = null
    },
    saveEditingNote: function() {
      const editing = notes.editing
      assert(!R.isNil(editing))
      assert(R.has('isNew', editing))
      assert(R.type(R.prop('isNew', editing)) === 'Boolean')
      const fakeNote = createFakeNote(Date.now())
      if (editing.isNew) {
        // const note = createFakeNote()
        notes.list = R.prepend(fakeNote, notes.list)
      } else {
        const idx = editing.idx
        assert(idx >= 0)
        assert(idx < notes.list.length)
        notes.list = R.update(editing.idx, fakeNote, notes.list)
      }
      notes.editing = null
    },
  }

  function handleEvent(event) {
    const performAction = R.curry((actionMap, event, actionName) =>
      R.propOr(
        () => assert.fail(`Action Not Found: ${actionName}`),
        actionName,
        actionMap,
      )(event),
    )
    const nextViewState = viewMachine.transition(notes.viewState.value, event)
    nextViewState.actions.forEach(performAction(actionMap, event))

    notes.viewState = nextViewState
  }

  emitter.on('DOMContentLoaded', () => {
    emitter.on('notes:add', () => {
      handleEvent({type: 'add'})
      render()
    })
    emitter.on('notes:edit', idx => {
      handleEvent({type: 'edit', idx})
      render()
    })

    emitter.on('notes:discard', () => {
      handleEvent({type: 'discard'})
      render()
    })

    emitter.on('notes:save', () => {
      handleEvent({type: 'save'})
      render()
    })

    // emitter.emit('notes:edit', 2)
  })
}
