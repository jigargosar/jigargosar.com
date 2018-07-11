import React from 'react'
import {CenterLayout, List, ListItem, Title} from '../ui'
import {cn, F, mrInjectAll, renderKeyedById} from '../utils'
import {_} from '../../little-ramda'
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
          'flex items-center',
          'bw1 bb b--black-05',
          'hide-child',
          'debug_',
        )}
      >
        <div
          className={cn(
            'code bw0 outline-0 pr2 h-100 f4',
            note.isCollapseButtonDisabled
              ? 'o-0'
              : 'child pointer blue',
          )}
          style={{userSelect: 'none'}}
          onClick={note.onToggleExpand}
          tabIndex={-1}
        >
          {note.collapsed ? `+` : `-`}
        </div>

        <div className={cn('flex')} style={{marginTop: 2}}>
          <svg style={{width: 18, height: 18}} viewBox="0 0 18 18">
            {note.collapsed && (
              <circle cx="9" cy="9" r="9" fill={'#e0e0e0'} />
            )}
            <circle cx="9" cy="9" r="3" fill={'#666666'} />
          </svg>
        </div>

        <input
          className={cn(
            'flex-auto ma0 pa1 input-reset bw0 lh-copy outline-0',
          )}
          value={note.text}
          {...note.textInputHandlers}
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
