import React, {Component} from 'react'
import {_contains, _forEachObjIndexed, _map, _type} from './little-ramda'
import root from './models'

class App extends Component {
  render() {
    const {state, setState} = this
    const notes = root.notesList

    return (
      <div>
        {renderHeader()}
        <button onClick={root.addNote}>Add</button>
        {_map(renderNote)(notes)}
      </div>
    )

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
