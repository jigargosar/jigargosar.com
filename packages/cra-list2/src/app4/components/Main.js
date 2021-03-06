import React from 'react'
import {
  Btn,
  CenterLayout,
  List,
  ListItem,
  Paper,
  Section,
  Text,
  Title,
} from './ui'
import {
  C,
  cn,
  F,
  isAnyHotKey,
  isHotKey,
  mrInjectAll,
  observer,
  renderKeyedById,
  wrapPD,
} from './utils'
import {_} from '../little-ramda'
import FocusChild from './mobx/FocusChild'
import {localActorId, shortenAID} from '../services/ActorId'
import {LinkTo} from './mobx/Router'
import TimeAgo from 'react-timeago'
import {BaseStyle} from './Styled'

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
    <Text className={cn('pa1 flex-auto', {'o-50': note.deleted})}>
      {/*{`A:${shortenAID(note.actorId)}: ${note.displayText}`}*/}
      {`${note.displayText}`}
    </Text>
  )
})

const Note = observer(function Note({note, focusComponentRef}) {
  const NoteContent = note.isEditing ? NoteInput : NoteText
  return (
    <FocusChild shouldFocus={note.isSelected}>
      <ListItem
        ref={focusComponentRef}
        className={cn('flex items-center lh-copy', {
          'bg-lightest-blue': note.isSelected,
        })}
        tabIndex={note.isSelected ? 0 : null}
      >
        <Text>{`sidx: ${note.sortIdx}`}</Text>
        <NoteContent note={note} />
        <Text>
          <TimeAgo date={note.createdAt} live={true} minPeriod={30} />
        </Text>
        <Text>
          <TimeAgo
            date={note.modifiedAt}
            live={true}
            minPeriod={30}
          />
        </Text>
      </ListItem>
    </FocusChild>
  )
})

const ListToolbar = mrInjectAll(function ListToolbar({view}) {
  return (
    <Section className={cn('pl3')}>
      <Btn onClick={view.onAddNewNoteEvent}>ADD</Btn>
    </Section>
  )
})

const NoteListShortcuts = mrInjectAll(
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

const NoteList = mrInjectAll(function NoteList({view}) {
  return (
    <div>
      <NoteListShortcuts />
      <ListToolbar />
      <Paper>
        <List>
          {renderKeyedById(Note, 'note', view.noteDisplayList)}
        </List>
      </Paper>
    </div>
  )
})

const AppHeader = mrInjectAll(function AppHeader({fire}) {
  const {auth} = fire
  return (
    <div className={'flex items-center pv3 shadow-1 bg-light-blue'}>
      <LinkTo to={'root'}>
        <Title className={cn('flex-auto')}>Notes</Title>
      </LinkTo>

      <Text className={cn('flex-auto')}>
        {`A:${shortenAID(localActorId)}`}
      </Text>

      <div className={cn('flex items-center')}>
        {!auth.isAuthKnown && <Text>Loading...</Text>}
        {auth.isSignedOut && (
          <F>
            <Btn onClick={auth.signInWithRedirect}>SignIn</Btn>
            <Btn onClick={auth.signInWithPopup}>SignInWithPopup</Btn>
          </F>
        )}
        {auth.isSignedIn && (
          <F>
            <Text>{auth.displayName}</Text>
            <Btn onClick={auth.signOut}>SignOut</Btn>
          </F>
        )}
      </div>
    </div>
  )
})

const Main = mrInjectAll(function App({pop}) {
  return (
    <BaseStyle>
      <CenterLayout>
        <AppHeader />
        {/*{pop.isRunningAsBrowserPopup ? 'POPUP' : <NoteList />}*/}
        <NoteList />
      </CenterLayout>
    </BaseStyle>
  )
})

export default Main
