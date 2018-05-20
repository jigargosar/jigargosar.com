const Machine = require('xstate').Machine
const R = require('ramda')
const assert = require('assert')
const N = require('../models/note')
const log = require('nanologger')('notes')

module.exports = store

const fakeNotes = R.times(N.createFakeNote, 15)

const initialStateValue = 'list'

const viewMachine = Machine({
  key: 'notes',
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
    startEditingNote: function({idx, id}) {
      assert(idx >= 0)
      assert(idx < notes.list.length)
      assert.equal(R.type(id), 'String')
      assert(R.isNil(notes.editing))
      const note = R.find(R.propEq('id', id), notes.list)

      assert(!R.isNil(note))

      notes.editing = {
        idx,
        id,
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
      const fakeNote = N.createFakeNote()
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

    log.debug('actions', ...nextViewState.actions, {
      from: notes.viewState.value,
      to: nextViewState.value,
    })

    nextViewState.actions.forEach(performAction(actionMap, event))

    notes.viewState = nextViewState
  }

  emitter.on('DOMContentLoaded', () => {
    emitter.on('notes:add', () => {
      handleEvent({type: 'add'})
      render()
    })
    emitter.on('notes:edit', (idx, id) => {
      handleEvent({type: 'edit', idx, id})
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
    // setTimeout(() => {
    //   emitter.emit('notes:edit', 2)
    // }, 1000)
  })
}
