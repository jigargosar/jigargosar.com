import React, {Component} from 'react'
import {ObjectValue} from 'react-values'
import * as _ from 'ramda'

function createNote(idx) {
  const id = `${idx + 1}`
  return {
    id,
    text: `Note text ${id}`,
  }
}

const initialState = {notes: _.times(createNote)(5)}

function addNote({state, setState}) {
  const notes = state.notes
  setState({
    notes: _.append(createNote(notes.length))(notes),
  })
}

class App extends Component {
  render() {
    return (
      <ObjectValue defaultValue={initialState}>
        {({value: state, assign: setState}) => (
          <div>
            <header>
              <h1>Fun React Notes</h1>
            </header>
            <Log comp={'App'} state={state} />
            {_.map(renderNote)(state.notes)}
            <button onClick={() => addNote({state, setState})}>Add</button>
          </div>
        )}
      </ObjectValue>
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
