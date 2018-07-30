import React, {Component, Fragment} from 'react'
import {_map} from './little-ramda'
import root from './models'
import {observer, whenKey, withKeyEvent} from './components/utils'
import {AutoSize} from './components/lib/AutoSize'

@observer
class App extends Component {
  render() {
    const notes = root.notesList

    return (
      <Fragment>
        {renderHeader()}
        <button onClick={root.addNote}>Add</button>
        {_map(renderNote)(notes)}
      </Fragment>
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

export default App
