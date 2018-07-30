import React, {Component} from 'react'
import {_map} from './little-ramda'
import root, {resetRoot} from './models'
import {
  FocusTrap,
  observer,
  whenKey,
  withKeyEvent,
} from './components/utils'
import {AutoSize} from './components/lib/AutoSize'

@observer
class App extends Component {
  render() {
    const notes = root.notesList

    return (
      <FocusTrap
        onKeyDown={withKeyEvent(whenKey('mod+enter')(root.addNote))}
      >
        {renderHeader()}
        <button onClick={root.addNote}>Add</button>
        <button onClick={resetRoot}>Reset Root</button>
        {_map(renderNote)(notes)}
      </FocusTrap>
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
      <div onFocus={note.onFocusSetSelected}>
        <AutoSize>
          <textarea
            style={{display: 'block', width: '100%'}}
            rows={1}
            value={note.text}
            onChange={e => note.update({text: e.target.value})}
          />
        </AutoSize>
      </div>
    )
  }
}

export default App
