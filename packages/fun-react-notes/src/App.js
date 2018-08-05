import React, {Component} from 'react'
import {_map, _prop} from './ramda'
import store from './store'
import {cn, FocusTrap, observer, wrapSP} from './components/utils'
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed'
import {autorun, computed, Disposers} from './little-mst'
import ReactDOM from 'react-dom'
import EventListener from 'react-event-listener'
import {wrapDisplayName} from './components/little-recompose'
import {SingleSelectionStore} from './SingleSelectionStore'

@observer
class Btn extends Component {
  render({children, ...other} = this.props) {
    return (
      <div
        {...other}
        // role={'button'}
        className={cn('input-reset dib ph1 f5 blue normal pointer')}
      >
        {children}
      </div>
    )
  }
}

const disposable = BaseComponent =>
  observer(
    class Disposable extends Component {
      static displayName = wrapDisplayName(BaseComponent, 'Disposable')
      disposers = Disposers()
      addDisposer = disposer => this.disposers.push(disposer)
      autorun = (view, opts = {}) => this.addDisposer(autorun(view, opts))

      componentWillUnmount() {
        this.disposers.dispose()
      }

      render() {
        return (
          <BaseComponent
            addDisposer={this.addDisposer}
            autorun={this.autorun}
            {...this.props}
          />
        )
      }
    },
  )

const withSelectionHandler = BaseComponent =>
  observer(
    class SelectionHandler extends Component {
      static displayName = wrapDisplayName(
        BaseComponent,
        'SelectionHandler',
      )
      selection = SingleSelectionStore.create()
      render() {
        return <BaseComponent selection={this.selection} {...this.props} />
      }
    },
  )
@observer
class App extends Component {
  render() {
    return (
      <FocusTrap>
        <EventListener target={'document'} onKeyDown={store.onKeyDown} />
        <div className={cn('vh-100 overflow-hidden', 'flex flex-column')}>
          <header className={cn('w-100')}>
            <h1>Fun React Notes</h1>
            <h4>
              <Btn onClick={store.onAddNote}>Add</Btn>
              <Btn onClick={store.reset}>Reset Store</Btn>
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

@withSelectionHandler
@disposable
@observer
class NoteList extends Component {
  @computed
  get containerProps() {
    return this.selection.getContainerProps()
  }

  @computed
  get notes() {
    return store.allNotes
  }

  @computed
  get selection() {
    return this.props.selection
  }

  componentDidMount() {
    this.selection.setComputedKeys(
      computed(() => this.notes.map(_prop('id'))),
    )
    this.props.autorun(() =>
      store.setSelectedNoteIdx(this.selection.selectedIdx),
    )
    this.props.autorun(() => {
      if (store.selectedNote) {
        this.selection.setSelectedKey(store.selectedNote.id)
      }
    })
  }

  render() {
    return (
      <div {...this.containerProps}>
        {_map(this.renderNote)(this.notes)}
      </div>
    )
  }
  renderNote = note => (
    <NoteListItem key={note.id} note={note} selection={this.selection} />
  )
}

@disposable
@observer
class NoteListItem extends Component {
  @computed
  get selection() {
    return this.props.selection
  }

  @computed
  get itemProps() {
    return this.selection.getItemProps({key: this.note.id})
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

  componentDidMount() {
    this.props.addDisposer(
      autorun(() => {
        if (this.isSelected) {
          requestAnimationFrame(() => ReactDOM.findDOMNode(this).focus())
        }
      }),
    )
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
            'bg-black-10': isSelected,
            outline: this.isFocused,
          },
          'flex',
        )}
        tabIndex={isSelected ? 0 : null}
      >
        <div className={cn('flex-auto truncate')}>{this.displayText}</div>
        <div className={cn({dn: !isSelected})}>
          <Btn onClick={this.onDelete}>X</Btn>
        </div>
      </ScrollIntoViewIfNeeded>
    )
  }
}

export default App
