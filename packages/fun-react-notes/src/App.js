import React, {Component} from 'react'
import {_compose, _map} from './ramda'
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
import {computed} from './little-mst'

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
        <div className={cn('vh-100 overflow-hidden', 'flex flex-column')}>
          <header className={cn('w-100')}>
            <h1>Fun React Notes</h1>
            <h4>
              <button onClick={store.onAddNote}>Add</button>
              <button onClick={store.reset}>Reset Store</button>
            </h4>
          </header>
          <main className={cn('flex-auto overflow-hidden', 'flex')}>
            <aside
              className={cn(
                'w-33 overflow-scroll',
                'ba br-0 b--moon-gray',
              )}
            >
              <NoteList />
            </aside>
            <div className={cn('flex-auto flex', 'ba b--moon-gray')}>
              <NoteEditor />
            </div>
          </main>
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
        className={cn('input-reset w-100 pa2 m0 bn b--moon-gray')}
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
  @computed
  get containerProps() {
    return store.notesSelection.getContainerProps()
  }
  render() {
    return (
      <div {...this.containerProps}>
        {_map(note => <Note {...note.listItemProps} />)(store.allNotes)}
      </div>
    )
  }
}

@observer
class Note extends Component {
  @computed
  get containerProps() {
    return store.notesSelection.getItemProps({key: this.note.id})
  }

  @computed
  get note() {
    return this.props.note
  }

  @computed
  get displayText() {
    const {note} = this.props
    return (note.text || 'empty').trim().split('\n')[0]
  }
  render({note} = this.props) {
    return (
      <ScrollIntoViewIfNeeded
        {...this.containerProps}
        active={note.isSelected}
        options={{behavior: 'smooth', scrollMode: 'if-needed'}}
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
        <div className={cn('flex-auto truncate')}>{this.displayText}</div>
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
