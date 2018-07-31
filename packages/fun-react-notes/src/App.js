import React, {Component} from 'react'
import {_map} from './little-ramda'
import store from './store'
import {
  cn,
  FocusTrap,
  observer,
  whenKey,
  withKeyEvent,
} from './components/utils'
import {AutoSize} from './components/lib/AutoSize'

@observer
class App extends Component {
  render() {
    const notes = store.allNotes

    return (
      <FocusTrap
        onKeyDown={withKeyEvent(
          whenKey('mod+enter')(store.onAddNoteAfterSelected),
          whenKey('shift+mod+enter')(store.onAddNoteBeforeSelected),
        )}
      >
        <div className={cn('flex flex-wrap')}>
          <div className={cn('w-100')}>
            <h1>Fun React Notes</h1>
            <button onClick={store.onAddNote}>Add</button>
            <button onClick={store.reset}>Reset Store</button>
          </div>
          <div className={cn('w-33 flex flex-wrap')}>
            {_map(renderNote)(notes)}
          </div>
        </div>
      </FocusTrap>
    )

    function renderNote(note) {
      return <Note key={note.id} note={note} />
    }
  }
}

@observer
class Note extends Component {
  onFocusSetSelected = () => {
    store.updateSelectedOnFocus(this.props.note)
  }

  onChangeUpdateText = e => this.props.note.update({text: e.target.value})

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
}

export default App
