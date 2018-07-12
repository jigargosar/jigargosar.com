import React from 'react'
import {
  Btn,
  CenterLayout,
  Lnk,
  List,
  ListItem,
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
import {_} from '../../little-ramda'
import {AppHeaderBar} from '../mobx/AppHeaderBar'

const Outline = mrInjectAll(function NoteOutline({note, view}) {
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
            'code bw0 outline-0 pl2 pr1 h-100 f4',
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
          className={cn('flex')}
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

        <input
          ref={note.onTextInputRef}
          className={cn(
            'flex-auto ma0 pa1 input-reset lh-copy outline-0',
            // 'bw0',
            'bn bw1 bb b--black-05',
          )}
          value={note.text || ''}
          {...note.textInputHandlers}
        />
        <div className={cn('mr2')}>{note.sortIdx}</div>
      </div>
      <OutlineChildren
        childNotes={note.shouldDisplayChildren ? note.childNotes : []}
      />
    </ListItem>
  )
})

const OutlineChildren = mrInjectAll(function ChildNotes({
  childNotes,
  m = 'ml4 mr3_ mt2_',
  shadow = '',
  className,
}) {
  if (_.isEmpty(childNotes)) {
    return <F />
  }
  return (
    <List
      m={m}
      shadow={shadow}
      className={cn('flex-auto', 'bw1 bl b--light-gray', className)}
    >
      {renderKeyedById(Outline, 'note', childNotes)}
    </List>
  )
})

OutlineChildren.propTypes = {
  childNotes: PropTypes.array.isRequired,
}

const NoteNavLink = mrInjectAll(function NoteNavLink({note}) {
  return (
    <Lnk
      color={'gray'}
      m={''}
      className={cn('pa2')}
      onClick={note.onZoomIn}
    >
      {`${note.navLinkText}`}
    </Lnk>
  )
})

const CurrentRootHeader = mrInjectAll(function ZoomedNoteHeader({
  view,
}) {
  const note = view.currentRoot
  return (
    <F>
      <div className={cn('ma2')}>
        <NoteNavLink note={view.rootNote} />
        <span>{`>`}</span>
      </div>
      <div className={cn('ma3 mt0')}>
        <input
          placeholder={'Title'}
          className={cn('outline-0 bw0 f2 w-100')}
          value={note.text || ''}
          onChange={note.onTextChange}
          // onFocus={e => {
          //   console.log(`'onFocus'`, 'onFocus')
          //   const target = e.target
          //   setImmediate(() => target.setSelectionRange(0, 0))
          // }}
        />
      </div>
      <div className={cn('ma3')}>
        <Btn onClick={note.onAddChild}>add</Btn>
      </div>
    </F>
  )
})

const OutlineRoot = mrInjectAll(function NoteList({view}) {
  return (
    <div
      className={cn('bg-white mh0 mh3-ns mb3 mv3-ns shadow-1-ns pv2')}
    >
      <CurrentRootHeader />

      <OutlineChildren
        m={''}
        className={cn('bn bw0')}
        shadow={''}
        childNotes={view.currentRoot.childNotes}
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
