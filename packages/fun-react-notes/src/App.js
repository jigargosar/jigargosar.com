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
        onKeyDown={withKeyEvent(
          //
          whenKey('mod+enter')(root.onAddNoteAfterSelected),
          whenKey('shift+mod+enter')(root.onAddNoteBeforeSelected),
        )}
      >
        {renderHeader()}
        <button onClick={root.onAddNote}>Add</button>
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
  onFocusSetSelected = () => {
    root.updateSelectedOnFocus(this.props.note)
  }

  render({note} = this.props) {
    return (
      <div onFocus={this.onFocusSetSelected}>
        <div>{note.sortIdx}</div>
        <AutoSize>
          <textarea
            id={note.id}
            style={{display: 'block', width: '100%'}}
            rows={1}
            value={note.text}
            onChange={this.onChangeUpdateText}
          />
        </AutoSize>
      </div>
    )
  }

  onChangeUpdateText = e => this.props.note.update({text: e.target.value})
}

export default App
