import React, {Component} from 'react'
import {AnyValue} from 'react-values'
import * as _ from 'ramda'

function createNote(idx) {
  const id = `${idx + 1}`
  return {
    id,
    text: `Note text ${id}`,
  }
}

const initialState = {notes: _.times(createNote)(5)}

function addNote(state) {
  const notes = state.value.notes
  state.set({
    notes: _.prepend(createNote(notes.length))(notes),
  })
}

class App extends Component {
  render() {
    return (
      <AnyValue defaultValue={initialState}>
        {state => (
          <div>
            <header>
              <h1>Fun React Notes</h1>
            </header>
            <Log comp={'App'} state={state.value} />
            {_.map(renderNote(state))(state.value.notes)}
            <button onClick={e => addNote(state)}>Add</button>
          </div>
        )}
      </AnyValue>
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

function renderNote(state) {
  return note => <Note key={note.id} note={note} state={state} />
}
class Log extends Component {
  render() {
    console.groupCollapsed('Props', this.props)
    _.forEachObjIndexed((v, k) => {
      console.log('Log', k, v)
      if (_.contains(_.type(v))(['Object', 'Array'])) {
        console.table(v)
      }
    })(this.props)
    console.groupEnd('end')
    return null
  }
}
