import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, mrInjectAll, whenKey, withKeyEvent} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {
  _,
  alwaysNothing,
  maybeOr,
  maybeOrElse,
  validate,
} from '../../little-ramda'
import Baobab from 'baobab'
import {
  appendNewSiblingNote,
  getChildren,
  getDebugId,
  getNoteId,
  getText,
  onNoteTextChangeEvent,
  selectChildren,
  selectText,
  whenCursorGet,
} from '../../ImmutableState/ImmutableNote'
import {state} from '../../ImmutableState/ImmutableNoteTree'
import {
  cursorIsRoot,
  maybeDownIfExists,
  maybeLeft,
  maybeRight,
  maybeUp,
} from './functional-baobab'
import S from 'sanctuary'

if (module.hot) {
  window.Baobab = Baobab
}

function focusNote(note) {
  const n = whenCursorGet(note)
  validate('O', [n])
  requestAnimationFrame(() => {
    const noteEl = document.getElementById(getNoteId(note))
    noteEl.focus()
  })
}

function maybeFocusNote(maybeNote) {
  S.map(note =>
    requestAnimationFrame(() => {
      const noteEl = document.getElementById(getNoteId(note))
      noteEl.focus()
    }),
  )(maybeNote)
}

function cursorForceUpdate(textCursor, component) {
  textCursor.on('update', () => component.forceUpdate())
}

function maybeNextSiblingNote(note) {
  return _.ifElse(cursorIsRoot)(alwaysNothing)(maybeRight)(note)
}
function maybePreviousSiblingNote(note) {
  return _.ifElse(cursorIsRoot)(alwaysNothing)(maybeLeft)(note)
}

function maybeParentNote(note) {
  return _.compose(S.chain(maybeUp), maybeUp)(note)
}

function maybeFirstChildNote(note) {
  return maybeDownIfExists(note.select('children'))
}

const maybeNextNote = n =>
  maybeOrElse(() => S.chain(maybeNextNote)(maybeParentNote(n)))(
    maybeNextSiblingNote(n),
  )

function maybeFirstVisibleChildOrNextNote(note) {
  return maybeOrElse(() => maybeNextNote(note))(
    maybeFirstChildNote(note),
  )
}

function lastVisibleLeafNoteOrSelf(note) {
  return _.compose(
    maybeOr(note),
    S.map(lastVisibleLeafNoteOrSelf),
    S.last,
    getChildren,
  )(note)
}

function maybePreviousNote(note) {
  return _.compose(
    maybeOrElse(() => maybeParentNote(note)),
    S.map(lastVisibleLeafNoteOrSelf),
  )(maybePreviousSiblingNote(note))
}

class NoteTextInput extends React.Component {
  get note() {
    return this.props.note
  }

  componentDidMount() {
    cursorForceUpdate(selectText(this.note), this)
  }

  render() {
    return (
      <input
        id={getNoteId(this.note)}
        className={cn('flex-auto', 'ma0 pa0 bw0 outline-0')}
        value={getText(this.note)}
        onChange={onNoteTextChangeEvent(this.note)}
        onKeyDown={this.onKeyDown}
      />
    )
  }

  onKeyDown = e => {
    const note = this.note
    withKeyEvent(
      whenKey('enter')(() => focusNote(appendNewSiblingNote(note))),
      whenKey('down')(() =>
        maybeFocusNote(maybeFirstVisibleChildOrNextNote(note)),
      ),
      whenKey('up')(() => maybeFocusNote(maybePreviousNote(note))),
    )(e)
  }
}

function NoteTextLine({note}) {
  return (
    <div className={cn('code flex items-center')}>
      <div className={cn('mr3')}>-</div>
      <div
        className={cn(
          'flex-auto',
          'flex items-center',
          'pv2',
          'bb bw1 b--light-gray',
        )}
      >
        <div className={cn('f6 gray mr3')}>{getDebugId(note)}</div>
        <div className={cn('flex-auto', 'flex')}>
          <NoteTextInput note={note} />
        </div>
      </div>
    </div>
  )
}

function NoteChild({note}) {
  return (
    <F>
      {<NoteTextLine note={note} />}
      <NoteChildren note={note} />
    </F>
  )
}

class NoteChildren extends React.Component {
  componentDidMount() {
    cursorForceUpdate(selectChildren(this.note), this)
  }

  get note() {
    return this.props.note
  }

  render() {
    return (
      <div className={cn('ml3')}>
        {_.map(childNote => (
          <F key={getNoteId(childNote)}>
            <NoteChild note={childNote} />
          </F>
        ))(selectChildren(this.note))}
      </div>
    )
  }
}

const rootNoteCursor = state.tree.select()

class NoteTree extends React.Component {
  componentDidMount() {
    focusNote(rootNoteCursor)
  }

  render = () => (
    <F>
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        <NoteChild note={rootNoteCursor} />
      </div>
    </F>
  )
}

const Main = mrInjectAll(function Main() {
  return (
    <TypographyDefaults className={cn('mb4')}>
      <AppHeaderBar>
        <Title className={cn('flex-auto')}>
          {`Immutable Note Outliner`}
        </Title>
      </AppHeaderBar>
      <CenterLayout>
        <NoteTree />
      </CenterLayout>
    </TypographyDefaults>
  )
})

export default Main
