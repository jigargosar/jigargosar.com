import React, {Component} from 'react'
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

function appendNote(state) {
  const notes = state.notes
  return {
    notes: _append(createNote(notes.length))(notes),
  }
}

class App extends Component {
  state = {notes: _times(createNote)(5)}

  setState = this.setState.bind(this)

  render() {
    const {state, setState} = this
    const {notes} = state

    return (
      <div>
        {renderHeader()}
        <button onClick={onAddNote}>Add</button>
        {_map(renderNote)(notes)}
      </div>
    )

    function onAddNote() {
      return setState(appendNote(state))
    }

    function renderHeader() {
      return (
        <header>
          <h1>Fun React Notes</h1>
        </header>
      )
    }

    function renderNote(note) {
      return <Note key={note.id} note={note} />
    }
  }
}

export default App

class Note extends React.PureComponent {
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
