import React, {Component} from 'react'
import {_map} from './little-ramda'
import root from './models'
import {observer} from 'mobx-preact'
import Note from './components/Note'
import {hot} from 'react-hot-loader'

class App extends Component {
  render() {
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

export default hot(module)(observer(App))
