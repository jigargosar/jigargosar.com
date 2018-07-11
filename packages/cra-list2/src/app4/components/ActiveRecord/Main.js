import React from 'react'
import {Button, CenterLayout, List, ListItem, Title} from '../ui'
import {
  cn,
  F,
  isAnyHotKey,
  mrInjectAll,
  renderKeyedById,
  wrapPD,
} from '../utils'
import {_} from '../../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {RootContainer} from '../mobx/RootContainer'

const Outline = mrInjectAll(function NoteOutline({note, view}) {
  return (
    <ListItem
      className={cn('flex flex-column lh-copy')}
      // p={'pv2 pl3'}
      p={'pl3'}
      b={''}
    >
      <div
        className={cn(
          'flex-auto',
          'flex',
          'bw1 bb b--black-05',
          'debug_',
        )}
      >
        <Button
          className={cn('code bw0')}
          disabled={note.isCollapseButtonDisabled}
          onClick={() => view.onToggleNoteCollapsed(note)}
        >
          {note.collapsed ? `>` : `v`}
        </Button>

        <input
          className={cn(
            'flex-auto ma0 pa1 input-reset bw0 lh-copy outline-0',
          )}
          value={note.text}
          onChange={note.onTextChange}
          onFocus={e => e.target.setSelectionRange(0, 0)}
          onBlur={note.onTextBlur}
          onKeyDown={_.cond([
            [isAnyHotKey(['enter']), wrapPD(note.onEnter)],
            [isAnyHotKey(['escape']), wrapPD(note.onEscape)],
          ])}
        />
      </div>
      <OutlineChildren
        childNotes={note.shouldDisplayChildren ? note.childNotes : []}
      />
    </ListItem>
  )
})

const OutlineChildren = mrInjectAll(function ChildNotes({
  childNotes,
  m = 'mr3_ mt2_',
  shadow = '',
}) {
  if (_.isEmpty(childNotes)) {
    return <F />
  }
  return (
    <List m={m} shadow={shadow} className={cn('flex-auto')}>
      {renderKeyedById(Outline, 'note', childNotes)}
    </List>
  )
})

const OutlineRoot = mrInjectAll(function NoteList({view}) {
  return (
    <F>
      <OutlineChildren
        m={'mh0 mh3-ns mv3'}
        shadow={'shadow-1'}
        childNotes={view.noteList}
      />
    </F>
  )
})

const Main = mrInjectAll(function Main() {
  return (
    <RootContainer className={cn('mb4')}>
      <AppHeaderBar>
        <Title className={cn('flex-auto')}>
          {`Active Record Outliner`}
        </Title>
      </AppHeaderBar>
      <CenterLayout>
        <OutlineRoot />
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
