import React from 'react'
import {
  Button,
  CenterLayout,
  List,
  ListItem,
  Paper,
  RootContainer,
  Section,
  Title,
} from '../ui'
import {cn, mrInjectAll, renderKeyedById} from '../utils'
import {ActiveRecord} from '../../mobx/ActiveRecord'
import {createObservableObject} from '../../mobx/little-mobx'

const Notes = ActiveRecord({fieldNames: ['text'], name: 'Note'})

const view = createObservableObject({
  props: {
    mode: 'list',
    selection: [],
    modeProps: {},
    get notesList() {
      return Notes.findAll()
    },
  },
  actions: {
    beforeAdd() {
      if (this.mode === 'add') {
        Notes.createAndSave({text: this.modeProps.text})
      }
    },
    onAdd() {
      this.beforeAdd()
      this.mode = 'add'
      this.modeProps = {text: ''}
    },
    onTextChange(e) {
      this.modeProps.text = e.target.value
    },
  },
  name: 'view',
})

// const NoteInput = observer(function NoteInput({note}) {
//   return (
//     <input
//       autoFocus
//       className={cn('bw0 flex-auto ma0 pa1 lh-copy blue')}
//       placeholder={'Note text ...'}
//       value={note.text}
//       onChange={note.onTextChange}
//     />
//   )
// })
//
// const NoteText = observer(function NoteText({note}) {
//   return (
//     <Text className={cn('pa1 flex-auto', {'o-50': note.deleted})}>
//       {/*{`A:${shortenAID(note.actorId)}: ${note.displayText}`}*/}
//       {`${note.displayText}`}
//     </Text>
//   )
// })
//
// const Note = observer(function Note({note, focusComponentRef}) {
//   const NoteContent = note.isEditing ? NoteInput : NoteText
//   return (
//     <FocusChild shouldFocus={note.isSelected}>
//       <ListItem
//         ref={focusComponentRef}
//         className={cn('flex items-center lh-copy', {
//           'bg-lightest-blue': note.isSelected,
//         })}
//         tabIndex={note.isSelected ? 0 : null}
//       >
//         <Text>{`sidx: ${note.sortIdx}`}</Text>
//         <NoteContent note={note} />
//         <Text>
//           <TimeAgo date={note.createdAt} live={true} minPeriod={30} />
//         </Text>
//         <Text>
//           <TimeAgo
//             date={note.modifiedAt}
//             live={true}
//             minPeriod={30}
//           />
//         </Text>
//       </ListItem>
//     </FocusChild>
//   )
// })
//
// const ListToolbar = mrInjectAll(function ListToolbar({view}) {
//   return (
//     <Section className={cn('pl3')}>
//       <Button onClick={view.onAddNewNoteEvent}>ADD</Button>
//     </Section>
//   )
// })
//
// const NoteListShortcuts = mrInjectAll(
//   class NoteListShortcuts extends C {
//     componentDidMount() {
//       console.debug('NoteListShortcuts: componentDidMount')
//       window.addEventListener('keydown', this.onKeydown)
//     }
//
//     componentWillUnmount() {
//       console.debug('componentWillUnmount: componentWillUnmount')
//       window.removeEventListener('keydown', this.onKeydown)
//     }
//
//     onKeydown = e => {
//       console.debug('NoteListShortcuts.onKeydown', e)
//       const {view} = this.props
//       _.cond([
//         [isHotKey('ArrowUp'), wrapPD(view.gotoPrev)],
//         [isAnyHotKey(['ArrowDown']), wrapPD(view.gotoNext)],
//         [isAnyHotKey(['mod+ArrowDown']), wrapPD(view.moveDown)],
//         [isAnyHotKey(['mod+ArrowUp']), wrapPD(view.moveUp)],
//         [isHotKey('mod+shift+enter'), view.insertAbove],
//         [isAnyHotKey(['mod+enter', 'shift+enter']), view.insertBelow],
//         [isAnyHotKey(['enter']), view.onEnterKey],
//         [isHotKey('escape'), view.onEscapeKey],
//       ])(e)
//
//       if (e.target instanceof window.HTMLInputElement) {
//         return
//       }
//
//       _.cond([
//         [isAnyHotKey(['q']), wrapPD(view.onAddNewNoteEvent)],
//         [isAnyHotKey(['a']), wrapPD(view.insertBelow)],
//         [isAnyHotKey(['shift+a']), wrapPD(view.insertAbove)],
//         [
//           isAnyHotKey(['d', 'delete']),
//           wrapPD(view.onToggleDeleteSelectedEvent),
//         ],
//       ])(e)
//     }
//   },
// )
//
// const NoteList = mrInjectAll(function NoteList({view}) {
//   return (
//     <div>
//       <NoteListShortcuts />
//       <ListToolbar />
//       <Paper>
//         <List>
//           {renderKeyedById(Note, 'note', view.noteDisplayList)}
//         </List>
//       </Paper>
//     </div>
//   )
// })
//

const Note = mrInjectAll(function Note({note}) {
  return (
    <ListItem>
      {note.text || (
        <span className={cn('light-silver')}>Empty Text</span>
      )}
    </ListItem>
  )
})

const AddNote = mrInjectAll(function Note() {
  return (
    <ListItem>
      <input
        value={view.modeProps.text}
        onChange={view.onTextChange}
      />
    </ListItem>
  )
})

const ListToolbar = mrInjectAll(function ListToolbar() {
  return (
    <Section className={cn('pl3')}>
      <Button onClick={view.onAdd}>ADD</Button>
    </Section>
  )
})

const NoteList = mrInjectAll(function NoteList() {
  return (
    <div>
      {/*<NoteListShortcuts />*/}
      <ListToolbar />
      <List>
        {view.mode === 'add' && <AddNote />}
        {renderKeyedById(Note, 'note', view.notesList)}
      </List>
    </div>
  )
})

const AppHeader = mrInjectAll(function AppHeader() {
  return (
    <div className={'flex items-center pv3 shadow-1 bg-light-blue'}>
      <Title className={cn('flex-auto')}>Active Record Notes</Title>
    </div>
  )
})

const Main = mrInjectAll(function App() {
  return (
    <RootContainer>
      <CenterLayout>
        <AppHeader />
        <NoteList />
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
