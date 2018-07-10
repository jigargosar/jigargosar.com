import React from 'react'
import {
  Button,
  CenterLayout,
  List,
  ListItem,
  Section,
  Title,
} from '../ui'
import {
  cn,
  F,
  isAnyHotKey,
  mrInjectAll,
  renderKeyedById,
  wrapPD,
} from '../utils'
import {_} from '../../utils'
import FocusTrap from 'focus-trap-react'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {RootContainer} from '../mobx/RootContainer'

const ChildNotes = mrInjectAll(
  /**
   * @return {null}
   */
  function ChildNotes({childNotes, showAddNote, m = 'mr3 mt2'}) {
    if (!showAddNote && _.isEmpty(childNotes)) {
      return null
    }
    return (
      <List m={m} className={cn('flex-auto')}>
        {showAddNote && <NoteLineEdit />}
        {renderKeyedById(Note, 'note', childNotes)}
      </List>
    )
  },
)

const NoteLine = mrInjectAll(function NoteLine({note, view}) {
  return (
    <div className={cn('flex-auto flex items-center hide-child ')}>
      <Button
        className={cn('code bw0')}
        disabled={note.isCollapseButtonDisabled}
        onClick={() => view.onToggleNoteCollapsed(note)}
      >
        {note.collapsed ? `>` : `v`}
      </Button>

      <div className={cn('flex-auto mr2')}>
        {note.text || (
          <span className={cn('light-silver')}>Empty Text</span>
        )}
      </div>
      <div className={cn('child2')}>
        <Button onClick={() => view.onEditNote(note)}>e</Button>
        <Button onClick={() => view.onAddChild(note)}>+</Button>
        <Button onClick={() => view.onDelete(note)}>x</Button>
      </div>
    </div>
  )
})
const Note = mrInjectAll(function Note({note}) {
  return (
    <ListItem
      className={cn('pointer flex flex-column lh-copy')}
      p={'pv2 pl3'}
    >
      {note.isEditing ? <NoteLineEdit /> : <NoteLine note={note} />}
      <ChildNotes
        showAddNote={note.isAddingChild}
        childNotes={note.shouldDisplayChildren ? note.childNotes : []}
      />
    </ListItem>
  )
})

const NoteLineEdit = mrInjectAll(function NoteLineEdit({view}) {
  return (
    <ListItem className={cn('flex')}>
      <FocusTrap
        className={cn('flex flex-auto')}
        active={false}
        focusTrapOptions={{
          escapeDeactivates: false,
          clickOutsideDeactivates: true,
        }}
      >
        <input
          className={cn(
            'input-reset bw1 b--solid flex-auto ma0 pa1 lh-copy light-blue hover-blue outline-0',
          )}
          autoFocus
          value={view.mode.text}
          onChange={view.onTextChange}
          onFocus={e => e.target.setSelectionRange(0, 9999)}
          onBlur={view.onTextBlur}
          onKeyDown={_.cond([
            [isAnyHotKey(['enter']), wrapPD(view.onEnter)],
            [isAnyHotKey(['escape']), wrapPD(view.onEscape)],
          ])}
        />
      </FocusTrap>
    </ListItem>
  )
})

const ListToolbar = mrInjectAll(function ListToolbar({view}) {
  return (
    <Section className={cn('pl3')}>
      <Button onClick={view.onAdd}>ADD</Button>
    </Section>
  )
})

const NoteList = mrInjectAll(function NoteList({view}) {
  return (
    <F>
      <ListToolbar />
      <ChildNotes
        m={'mh0 mh3-ns'}
        showAddNote={view.isAddModeForParentId(null)}
        childNotes={view.notesList}
      />
    </F>
  )
})

const Main = mrInjectAll(function Main({view}) {
  return (
    <RootContainer className={cn('mb4')}>
      <AppHeaderBar>
        <Title className={cn('flex-auto')}>
          {`Active Record Notes: mode:${view.mode.name}`}
        </Title>
      </AppHeaderBar>
      <CenterLayout>
        <NoteList />
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
