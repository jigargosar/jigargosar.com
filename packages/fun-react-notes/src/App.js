import React, {Component, Fragment} from 'react'
import {_map} from './little-ramda'
import store from './store'
import {
  cn,
  FocusTrap,
  observer,
  whenKey,
  withKeyEvent,
} from './components/utils'

@observer
class App extends Component {
  render() {
    return (
      <FocusTrap
        onKeyDown={withKeyEvent(
          whenKey('mod+enter')(store.onAddNoteAfterSelected),
          whenKey('shift+mod+enter')(store.onAddNoteBeforeSelected),
        )}
      >
        <div className={cn('flex flex-column')}>
          <div className={cn('w-100')}>
            <h1>Fun React Notes</h1>
            <h4>
              <button onClick={store.onAddNote}>Add</button>
              <button onClick={store.reset}>Reset Store</button>
            </h4>
          </div>
          <div className={cn('flex-auto flex')}>
            <div className={cn('w-33')}>
              <div className={cn('flex flex-column')}>
                {_map(renderNote)(store.allNotes)}
              </div>
            </div>
            <div className={cn('flex-auto flex')}>
              {store.currentNote && (
                <NoteEditor note={store.currentNote} />
              )}
            </div>
          </div>
        </div>
      </FocusTrap>
    )

    function renderNote(note) {
      return (
        <Fragment key={note.id}>
          <Note note={note} />
        </Fragment>
      )
    }
  }
}

@observer
class NoteEditor extends Component {
  render() {
    let {note} = this.props
    const {sortIdx, id, text, onTextChange} = note
    return (
      <textarea
        id={id}
        className={cn('input-reset w-100 pa2 m0 b--moon-gray')}
        style={{
          resize: 'none',
          minHeight: 300,
        }}
        rows={1}
        value={text}
        onChange={onTextChange}
        placeholder={`${sortIdx} ${id}`}
      />
    )
  }
}

@observer
class Note extends Component {
  onFocusSetSelected = () => {
    store.updateSelectedOnFocus(this.props.note)
  }

  render({note} = this.props) {
    const displayText = (note.text || 'empty').truncate(30)
    return (
      <div
        className={cn('')}
        id={note.id}
        onClick={this.onFocusSetSelected}
      >
        <div
          className={cn(
            //
            'pa2',
            'bb b--moon-gray',
            {'blue bg-black-05': note.isSelected},
          )}
        >
          {displayText}
        </div>
      </div>
    )
  }
}

export default App
