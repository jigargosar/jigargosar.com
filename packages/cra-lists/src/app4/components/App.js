import React from 'react'
import {
  Button,
  CenterLayout,
  List,
  ListItem,
  RootContainer,
  Section,
  Text,
  Title,
} from './ui'
import {
  C,
  cn,
  injectAll,
  isAnyHotKey,
  isHotKey,
  observer,
  renderKeyedById,
  wrapPD,
} from './utils'
import {_} from '../utils'

const NoteInput = observer(function NoteInput({note}) {
  return (
    <input
      autoFocus
      className={cn('bw0 flex-auto ma0 pa1 lh-copy blue')}
      placeholder={'Note text ...'}
      value={note.text}
      onChange={note.onTextChange}
    />
  )
})

const NoteText = observer(function NoteText({note}) {
  return (
    <Text
      className={cn(
        'pa1 flex-auto',
        {'o-50': note.deleted},
        {'blue bg-washed-yellow': note.isSelected},
      )}
    >
      {note.displayText}
    </Text>
  )
})

const Note = observer(function Note({note}) {
  const NoteContent = note.isEditing ? NoteInput : NoteText
  return (
    <ListItem className={cn('flex items-center lh-copy')}>
      <Text>{`sidx: ${note.sortIdx}`}</Text>
      <Text>{`indent: ${note.indentLevel}`}</Text>
      <Text>{`pid: ${note.parentId}`}</Text>
      <NoteContent note={note} />
    </ListItem>
  )
})

const ListToolbar = injectAll(function ListToolbar({view}) {
  return (
    <Section className={cn('pl3')}>
      <Button onClick={view.onAddNewNoteEvent}>ADD</Button>
    </Section>
  )
})

const NoteListShortcuts = injectAll(
  class NoteListShortcuts extends C {
    componentDidMount() {
      console.debug('NoteListShortcuts: componentDidMount')
      window.addEventListener('keydown', this.onKeydown)
    }

    componentWillUnmount() {
      console.debug('componentWillUnmount: componentWillUnmount')
      window.removeEventListener('keydown', this.onKeydown)
    }

    onKeydown = e => {
      console.debug('NoteListShortcuts.onKeydown', e)
      const {view} = this.props
      _.cond([
        [isHotKey('ArrowUp'), wrapPD(view.gotoPrev)],
        [isAnyHotKey(['ArrowDown']), wrapPD(view.gotoNext)],
        [isAnyHotKey(['mod+ArrowDown']), wrapPD(view.moveDown)],
        [isAnyHotKey(['mod+ArrowUp']), wrapPD(view.moveUp)],
        [isHotKey('mod+shift+enter'), view.insertAbove],
        [isAnyHotKey(['mod+enter', 'shift+enter']), view.insertBelow],
        [isAnyHotKey(['enter']), view.onEnterKey],
        [isHotKey('escape'), view.onEscapeKey],
      ])(e)

      if (e.target instanceof window.HTMLInputElement) {
        return
      }

      _.cond([
        [isAnyHotKey(['q']), wrapPD(view.onAddNewNoteEvent)],
        [isAnyHotKey(['a']), wrapPD(view.insertBelow)],
        [isAnyHotKey(['shift+a']), wrapPD(view.insertAbove)],
        [
          isAnyHotKey(['d', 'delete']),
          wrapPD(view.onToggleDeleteSelectedEvent),
        ],
      ])(e)
    }
  },
)

const NoteList = injectAll(function NoteList({view}) {
  return (
    <div>
      <NoteListShortcuts />
      <ListToolbar />
      <List>
        {renderKeyedById(Note, 'note', view.noteDisplayList)}
      </List>
    </div>
  )
})

const App = observer(function App() {
  return (
    <RootContainer>
      <CenterLayout>
        <div className={'flex'}>
          <Title>Notes</Title>
        </div>
        <NoteList />
      </CenterLayout>
    </RootContainer>
  )
})

export default App
