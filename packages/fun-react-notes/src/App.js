import React, {Component} from 'react'
import {_map} from './little-ramda'
import root from './models'
import {observer, whenKey, withKeyEvent} from './components/utils'
import {AutoSize} from './components/lib/AutoSize'

@observer
class Note extends Component {
  render({note} = this.props) {
    return (
      <div>
        <AutoSize>
          <textarea
            style={{display: 'block', width: '100%'}}
            rows={1}
            value={note.text}
            onChange={e => note.update({text: e.target.value})}
            onKeyDown={withKeyEvent(whenKey('mod+enter')(root.addNote))}
          />
        </AutoSize>
      </div>
    )
  }
}

@observer
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

export default App
