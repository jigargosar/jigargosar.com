import React from 'react'
import {
  Btn,
  CenterLayout,
  List,
  ListItem,
  Lnk,
  Title,
  TypographyDefaults,
} from '../ui'
import {
  cn,
  F,
  mrInjectAll,
  PropTypes,
  renderKeyedById,
} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import FocusChild from '../mobx/FocusChild'

const OutlineNote = mrInjectAll(function OutlineNote({note}) {
  return (
    <ListItem
      className={cn('flex flex-column lh-copy')}
      // p={'pv2 pl3'}
      p={''}
      b={''}
    >
      <div
        className={cn(
          'flex-auto',
          'flex items-center',
          // 'bw1 bb b--black-05',
          'hide-child',
          'debug_',
        )}
      >
        <div
          className={cn(
            'code lh-solid bw0 outline-0 pl2 pr1 h-100 f4',
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

        <div
          className={cn('flex mr1')}
          style={{marginTop: 2}}
          onClick={note.onZoomIn}
        >
          <svg style={{width: 18, height: 18}} viewBox="0 0 18 18">
            {note.collapsed && (
              <circle cx="9" cy="9" r="9" fill={'#e0e0e0'} />
            )}
            <circle cx="9" cy="9" r="3" fill={'#666666'} />
          </svg>
        </div>

        <FocusChild shouldFocus={note.shouldFocus}>
          <input
            className={cn(
              'flex-auto ma0 pa0 input-reset lh-copy outline-0',
              // 'bw0',
              'bn bw1 bb b--black-05',
            )}
            value={note.textInputValue}
            {...note.textInputHandlers}
          />
        </FocusChild>
        <div className={cn('mr2')}>{note.sortIdx}</div>
      </div>
      {/*<OutlineChildren childNotes={note.visibleChildNotes} />*/}
      <OutlineChildren note={note} />
    </ListItem>
  )
})

const OutlineChildren = mrInjectAll(function ChildNotes({
  // childNotes,
  note,
  m = 'ml4 mr3_ mt2_',
  shadow = '',
  className,
}) {
  if (note.hasVisibleChildren) {
    return (
      <List
        m={m}
        shadow={shadow}
        className={cn('flex-auto', 'bw1 bl b--light-gray', className)}
      >
        {renderKeyedById(OutlineNote, 'note', note.visibleChildNotes)}
      </List>
    )
  } else {
    return <F />
  }
})

OutlineChildren.propTypes = {
  // childNotes: PropTypes.array.isRequired,
  note: PropTypes.object.isRequired,
}

const NoteNavLink = mrInjectAll(function NoteNavLink({note}) {
  return (
    <F>
      <Lnk
        color={'gray'}
        m={''}
        className={cn('pa2')}
        onClick={note.onNavLinkClicked}
      >
        {`${note.navLinkText}`}
      </Lnk>
      <span>{`>`}</span>
    </F>
  )
})

const OutlineNoteNav = mrInjectAll(function ZoomNoteNav({view}) {
  return (
    <div className={cn('ma2')}>
      {/*<NoteNavLink note={view.rootDisplayNote} />*/}
      {renderKeyedById(NoteNavLink, 'note', view.currentAncestors)}
    </div>
  )
})
const CurrentRootHeader = mrInjectAll(function CurrentRootHeader({
  view,
}) {
  const headerNote = view.currentRootDisplayNote
  return (
    <F>
      <div className={cn('ma3 mt0')}>
        <FocusChild shouldFocus={headerNote.shouldFocus}>
          <input
            placeholder={'Title'}
            className={cn('outline-0 bw0 f2 w-100')}
            value={headerNote.textInputValue}
            {...headerNote.textInputHandlers}
            // onFocus={e => {
            //   console.log(`'onFocus'`, 'onFocus')
            //   const target = e.target
            //   setImmediate(() => target.setSelectionRange(0, 0))
            // }}
          />
        </FocusChild>
      </div>
      {!headerNote.hasChildren && (
        <div className={cn('ma3')}>
          <Btn onClick={headerNote.onAddChild}>add</Btn>
        </div>
      )}
    </F>
  )
})

const OutlineRoot = mrInjectAll(function NoteList({view}) {
  return (
    <div
      className={cn('bg-white mh0 mh3-ns mb3 mv3-ns shadow-1-ns pv2')}
    >
      <OutlineNoteNav />
      <CurrentRootHeader />

      <OutlineChildren
        m={''}
        className={cn('bn bw0')}
        shadow={''}
        // childNotes={view.currentNotesList}
        note={view.currentRootDisplayNote}
      />
    </div>
  )
})

const Main = mrInjectAll(function Main() {
  return (
    <TypographyDefaults className={cn('mb4')}>
      <AppHeaderBar>
        <Title className={cn('flex-auto')}>
          {`Active Record Outliner`}
        </Title>
      </AppHeaderBar>
      <CenterLayout>
        <OutlineRoot />
      </CenterLayout>
    </TypographyDefaults>
  )
})

export default Main
