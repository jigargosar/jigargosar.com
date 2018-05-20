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
    list: [] || fakeNotes,
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
    startEditingNote: function({id}) {
      assert(R.isNil(notes.editing))

      assert.equal(R.type(id), 'String')

      const note = R.find(R.propEq('id', id), notes.list)
      assert(!R.isNil(note))

      notes.editing = {
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
        notes.list = R.prepend(fakeNote, notes.list)
      } else {
        const {id} = editing
        assert.equal(R.type(id), 'String')
        const noteIdx = R.findIndex(R.propEq('id', id), notes.list)
        assert.notEqual(noteIdx, -1)
        notes.list = R.update(noteIdx, fakeNote, notes.list)
      }
      notes.editing = null
      localStorage.setItem('choo-notes', JSON.stringify(notes.list))
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
    try {
      const list = JSON.parse(localStorage.getItem('choo-notes'))
      assert.equal(R.type(list), 'Array')
      state.notes.list = list
      render()
    } catch (e) {
      log.info(e)
    }

    emitter.on('notes:add', () => {
      handleEvent({type: 'add'})
      render()
    })
    emitter.on('notes:edit', ({id}) => {
      handleEvent({type: 'edit', id})
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
    //   emitter.emit('notes:edit', {id:`2`})
    // }, 1000)
  })
}
