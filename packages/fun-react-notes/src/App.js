import React, {Component} from 'react'
import {_map} from './ramda'
import store from './store'
import {
  cn,
  FocusTrap,
  observer,
  whenKey,
  withKeyEvent,
  wrapSP,
} from './components/utils'
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed'

@observer
class App extends Component {
  render() {
    return (
      <FocusTrap
        onKeyDown={withKeyEvent(
          whenKey('mod+enter')(store.onAddNoteAfterSelected),
          whenKey('shift+mod+enter')(store.onAddNoteBeforeSelected),
        )}
        className={cn('vh-100')}
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
              <NoteList />
            </div>
            <div className={cn('flex-auto flex')}>
              <NoteEditor />
            </div>
          </div>
        </div>
      </FocusTrap>
    )
  }
}

@observer
class NoteEditor extends Component {
  render(note = store.selectedNote) {
    if (!note) {
      return null
    }
    return (
      <textarea
        id={note.id}
        className={cn('input-reset w-100 pa2 m0 b--moon-gray')}
        style={{
          resize: 'none',
          minHeight: 300,
        }}
        rows={1}
        value={note.text}
        onChange={note.onTextChange}
        placeholder={`${note.sortIdx} ${note.id}`}
      />
    )
  }
}

@observer
class NoteList extends Component {
  render() {
    return (
      <div {...store.noteListProps}>
        {_map(note => <Note {...note.listItemProps} />)(store.allNotes)}
      </div>
    )
  }
}

@observer
class Note extends Component {
  render({note, ...other} = this.props) {
    return (
      <ScrollIntoViewIfNeeded
        {...other}
        active={note.isSelected}
        options={{behavior: 'auto', scrollMode: 'if-needed'}}
        id={note.id}
        className={cn(
          'pa2',
          'bb b--moon-gray',
          {
            'blue bg-black-05': note.isSelected,
            outline: note.isFocused,
          },
          'flex',
        )}
        tabIndex={note.isSelected ? 0 : null}
      >
        <div className={cn('flex-auto truncate')}>
          {(note.text || 'empty').split('\n')[0]}
        </div>
        <div className={cn({dn: !note.isSelected})}>
          <div
            role={'button'}
            className={cn('input-reset')}
            onClick={wrapSP(note.onDelete)}
          >
            X
          </div>
        </div>
      </ScrollIntoViewIfNeeded>
    )
  }
}

export default App
