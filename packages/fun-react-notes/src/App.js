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
            <h4>
              <button onClick={store.onAddNote}>Add</button>
              <button onClick={store.reset}>Reset Store</button>
            </h4>
          </div>
          <div className={cn('w-33 flex flex-wrap')}>
            {_map(renderNote)(notes)}
          </div>
        </div>
      </FocusTrap>
    )

    function renderNote(note) {
      return (
        <div key={note.id}>
          <Note note={note} />
        </div>
      )
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
    const {sortIdx, id} = note
    return (
      <div onFocus={this.onFocusSetSelected}>
        <AutoSize>
          <textarea
            id={note.id}
            style={{display: 'block', width: '100%', resize: 'none'}}
            rows={1}
            value={note.text}
            onChange={this.onChangeUpdateText}
            placeholder={`${sortIdx} ${id}`}
          />
        </AutoSize>
      </div>
    )
  }
}

export default App
