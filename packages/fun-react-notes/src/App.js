import React, {Component} from 'react'
import {State} from 'react-powerplug'
import {
  _append,
  _contains,
  _forEachObjIndexed,
  _map,
  _times,
  _type,
} from './little-ramda'

function createNote(idx) {
  const id = `${idx + 1}`
  return {
    id,
    text: `Note text ${id}`,
  }
}

const initialState = {notes: _times(createNote)(5)}

function appendNote(state) {
  const notes = state.notes
  return {
    notes: _append(createNote(notes.length))(notes),
  }
}

class App extends Component {
  render() {
    return (
      <State initial={initialState}>
        {({state, setState}) => (
          <div>
            <header>
              <h1>Fun React Notes</h1>
            </header>
            <Log comp={'App'} state={state} />
            {_map(renderNote)(state.notes)}
            <button onClick={() => setState(appendNote(state))}>
              Add
            </button>
          </div>
        )}
      </State>
    )
  }
}

export default App

class Note extends Component {
  render() {
    const {note} = this.props
    return (
      <div>
        <Log comp={'Note'} {...note} />
        <small>{note.id} : </small>
        <span>{note.text}</span>
      </div>
    )
  }
}

function renderNote(note) {
  return <Note key={note.id} note={note} />
}
class Log extends Component {
  render() {
    console.groupCollapsed('Props', this.props)
    _forEachObjIndexed((v, k) => {
      console.log('Log', k, v)
      if (_contains(_type(v))(['Object', 'Array'])) {
        console.table(v)
      }
    })(this.props)
    console.groupEnd('end')
    return null
  }
}
