// Foo

/*eslint-disable*/
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
  cn,
  injectAllStates,
  isAnyHotKey,
  isHotKey,
  observer,
  OC,
  renderKeyedById,
  WithState,
} from './utils'
import {_, R} from '../utils'
import {o} from '../../StateContext'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

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

const NoteText = o(function NoteText({note}) {
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

const Note = o(function Note({note}) {
  const NoteContent = note.isEditing ? NoteInput : NoteText
  return (
    <ListItem className={cn('flex items-center lh-copy')}>
      <Text>{`${note.sortIdx}`}</Text>
      <NoteContent note={note} />
    </ListItem>
  )
})

function ListToolbar() {
  return (
    <WithState>
      {({view}) => (
        <Section className={cn('pl3')}>
          <Button onClick={view.onAddNewNoteEvent}>ADD</Button>
        </Section>
      )}
    </WithState>
  )
}

class NoteListShortcuts extends OC {
  componentDidMount() {
    console.debug('NoteListShortcuts: componentDidMount')
    window.addEventListener('keydown', this.onKeydown)
  }

  componentWillUnmount() {
    console.debug('componentWillUnmount: componentWillUnmount')
    window.removeEventListener('keydown', this.onKeydown)
  }

  render() {
    return (
      <WithState>
        {({view}) => {
          this.view = view
          return null
        }}
      </WithState>
    )
  }

  onKeydown = e => {
    console.debug('window.keydown', e)
    const wrapPD = fn => e => {
      e.preventDefault()
      fn(e)
    }
    const view = this.view
    R.cond([
      [isHotKey('ArrowUp'), wrapPD(view.gotoPrev)],
      [isAnyHotKey(['ArrowDown']), wrapPD(view.gotoNext)],
      [isHotKey('mod+shift+enter'), view.insertAbove],
      [isHotKey('mod+enter'), view.insertBelow],
      [isAnyHotKey(['enter']), view.onEnterKey],
      [isHotKey('escape'), view.onEscapeKey],
    ])(e)

    if (e.target instanceof window.HTMLInputElement) {
      return
    }

    R.cond([
      [isHotKey('q'), wrapPD(view.onAddNewNoteEvent)],
      [
        isAnyHotKey(['d', 'delete']),
        wrapPD(view.onToggleDeleteSelectedEvent),
      ],
    ])(e)
  }
}

const NoteList = _.compose(injectAllStates)(function NoteList({
  view,
  state,
}) {
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

const App = o(function App() {
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
