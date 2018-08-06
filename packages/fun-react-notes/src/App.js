import React, {Component} from 'react'
import {_map} from './ramda'
import store from './store'
import {cn, FocusTrap, observer, wrapSP} from './components/utils'
import {autorun, computed, Disposers} from './little-mst'
import EventListener from 'react-event-listener'
import {wrapDisplayName} from './components/little-recompose'

@observer
class App extends Component {
  render() {
    return <View store={store} />
  }
}

export default App

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

@observer
class View extends Component {
  render({store} = this.props) {
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
              <NoteList store={store} />
            </aside>
            <div className={cn('flex-auto flex', 'ba b--moon-gray')}>
              <NoteEditor store={store} />
            </div>
          </main>
        </div>
      </FocusTrap>
    )
  }
}

@observer
class NoteEditor extends Component {
  @computed
  get focusProps() {
    return {
      onFocus: () => store.setEditorFocused(true),
      onBlur: () => store.setEditorFocused(false),
    }
  }

  render() {
    const note = store.selectedNote
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

@disposable
@observer
class NoteList extends Component {
  render({store} = this.props) {
    return (
      <div>
        {_map(note => (
          <NoteListItem key={note.id} note={note} store={store} />
        ))(store.allNotes)}
      </div>
    )
  }
}

@disposable
@observer
class NoteListItem extends Component {
  @computed
  get isSelected() {
    return this.store.selectedNote === this.note
  }

  @computed
  get store() {
    return this.props.store
  }

  @computed
  get note() {
    return this.props.note
  }

  @computed
  get displayText() {
    return (this.note.text || 'empty').trim().split('\n')[0]
  }

  onDelete = wrapSP(() => this.store.deleteNote(this.note))
  onClick = wrapSP(() => this.store.setSelectedNote(this.note))

  render({note} = this.props) {
    const isSelected = this.isSelected
    return (
      <div
        {...this.itemProps}
        onClick={this.onClick}
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
        // tabIndex={isSelected ? 0 : null}
      >
        <div className={cn('flex-auto truncate')}>{this.displayText}</div>
        <div className={cn({dn: !isSelected})}>
          <Btn onClick={this.onDelete}>X</Btn>
        </div>
      </div>
    )
  }
}
