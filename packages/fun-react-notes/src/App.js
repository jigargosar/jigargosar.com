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
import {SelectionContainer} from '@zendeskgarden/react-selection'

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
              <NoteList />
            </div>
            <div className={cn('flex-auto flex')}>
              {store.selectedNote && (
                <NoteEditor note={store.selectedNote} />
              )}
            </div>
          </div>
        </div>
      </FocusTrap>
    )
  }
}

@observer
class NoteEditor extends Component {
  render({note} = this.props) {
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
      <div {...store.ns.getContainerProps()}>
        {_map(note => (
          <Note
            {...store.ns.getItemProps({
              key: note.id,
              note,
            })}
          />
        ))(store.allNotes)}
      </div>
    )
  }
}

// @observer
// class NoteList extends Component {
//   render() {
//     return (
//       <SelectionContainer
//         direction="vertical"
//         focusedKey={store.focusedKey}
//         selectedKey={store.selectedKey}
//         onStateChange={store.setSelectionState}
//       >
//         {({getContainerProps, getItemProps}) => (
//           <div {...getContainerProps()}>
//             {_map(note => (
//               <Note
//                 {...getItemProps({
//                   key: note.id,
//                   note,
//                 })}
//               />
//             ))(store.allNotes)}
//           </div>
//         )}
//       </SelectionContainer>
//     )
//   }
// }
//
@observer
class Note extends Component {
  render({note, ...other} = this.props) {
    return (
      <div
        {...other}
        id={note.id}
        // onClick={() => store.updateSelectedOnFocus(note)}
        className={cn('pa2', 'bb b--moon-gray', {
          'blue bg-black-05': note.isSelected,
          outline: note.isFocused,
        })}
      >
        {(note.text || 'empty').truncate(30)}
      </div>
    )
  }
}

export default App
