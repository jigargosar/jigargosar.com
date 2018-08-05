import React, {Component} from 'react'
import {_map} from './ramda'
import store from './store'
import {cn, FocusTrap, observer, wrapSP} from './components/utils'
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed'
import {computed} from './little-mst'
import ReactDOM from 'react-dom'

@observer
class App extends Component {
  render() {
    return (
      <FocusTrap onKeyDown={store.onKeyDown}>
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
  get focusProps() {
    return {
      onFocus: () => store.setEditorFocused(true),
      onBlur: () => store.setEditorFocused(false),
    }
  }

  render(note = store.selectedNote) {
    if (!note) {
      return null
    }
    return (
      <textarea
        {...this.focusProps}
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
        {_map(note => <NoteListItem key={note.id} note={note} />)(
          store.allNotes,
        )}
      </div>
    )
  }
}

@observer
class Btn extends Component {
  render({children, other} = this.props) {
    return (
      <div {...other} role={'button'} className={cn('input-reset')}>
        {children}
      </div>
    )
  }
}

@observer
class NoteListItem extends Component {
  @computed
  get itemProps() {
    return store.notesSelection.getItemProps({key: this.note.id})
  }

  @computed
  get isSelected() {
    return store.selectedNote === this.note
  }

  @computed
  get isFocused() {
    return false
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

  focusIfNeeded = () => {
    if (this.isSelected) {
      ReactDOM.findDOMNode(this).focus()
    }
  }

  componentDidMount() {
    this.focusIfNeeded()
  }

  componentDidUpdate() {
    this.focusIfNeeded()
  }

  onDelete = wrapSP(() => store.deleteNote(this.note))

  render({note} = this.props) {
    const isSelected = this.isSelected
    return (
      <ScrollIntoViewIfNeeded
        {...this.itemProps}
        active={isSelected}
        id={note.id}
        className={cn(
          'pa2',
          'bb b--moon-gray',
          {
            'blue bg-black-05': isSelected,
            outline: this.isFocused,
          },
          'flex',
        )}
        tabIndex={isSelected ? 0 : null}
      >
        <div className={cn('flex-auto truncate')}>{this.displayText}</div>
        <div className={cn({dn: !isSelected})}>
          <Btn onClick={wrapSP(note.onDelete)}>X</Btn>
        </div>
      </ScrollIntoViewIfNeeded>
    )
  }
}

export default App
