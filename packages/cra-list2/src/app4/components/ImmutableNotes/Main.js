import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, whenKey, withKeyEvent} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'

import {_, validate} from '../../little-ramda'
import Baobab from 'baobab'
import {
  appendNewSiblingNote,
  deleteAndGetMaybePreviousNote,
  getDebugId,
  getNoteId,
  getText,
  maybeFirstVisibleChildOrNextNote,
  maybePreviousNote,
  selectChildren,
  selectText,
  setNoteText,
  whenCursorGet,
} from '../../ImmutableState/ImmutableNote'
import {
  getRootNoteCursor,
  state,
} from '../../ImmutableState/ImmutableNoteTree'
import S from 'sanctuary'
import {OnMount} from '../behaviour/OnMount'

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
  return note
}

function maybeFocusNote(maybeNote) {
  return S.map(focusNote)(maybeNote)
}

function cursorForceUpdate(textCursor, component) {
  textCursor.on('update', () => component.forceUpdate())
}

function getInputSelectionRangeFromEvent(e) {
  return {start: e.target.selectionStart, end: e.target.selectionEnd}
}

function isSelectionRangeAtZero(selectionRange) {
  return selectionRange.start === 0 && selectionRange.end === 0
}

function focusPreviousNote(note) {
  return maybeFocusNote(maybePreviousNote(note))
}

function appendNoteText(deletedText, prev) {
  setNoteText(`${getText(prev)}${deletedText}`, prev)
  return prev
}

const onNoteInputKeyDown = note =>
  withKeyEvent(
    whenKey('enter')(() => focusNote(appendNewSiblingNote(note))),
    whenKey('backspace')(e => {
      const selectionRange = getInputSelectionRangeFromEvent(e)
      const selectionAtStart = isSelectionRangeAtZero(selectionRange)
      if (selectionAtStart) {
        // focusPreviousNote(note)
        const deletedText = getText(note)
        const maybePrev = deleteAndGetMaybePreviousNote(note)
        maybeFocusNote(maybePrev)
        S.map(prev =>
          focusNote(
            appendNoteText(deletedText, prev) /*{start:0,end:0}*/,
          ),
        )(maybePrev)
      }
    }),
    whenKey('down')(() =>
      maybeFocusNote(maybeFirstVisibleChildOrNextNote(note)),
    ),
    whenKey('up')(() => focusPreviousNote(note)),
  )

function onNoteTextChangeEvent(note) {
  return function(e) {
    return setNoteText(e.target.value, note)
  }
}

class NoteTextInput extends React.Component {
  componentDidMount() {
    cursorForceUpdate(selectText(this.props.note), this)
  }

  render() {
    const note = this.props.note
    return (
      <input
        id={getNoteId(note)}
        className={cn('flex-auto', 'ma0 pa0 bw0 outline-0')}
        value={getText(note)}
        onChange={onNoteTextChangeEvent(note)}
        onKeyDown={onNoteInputKeyDown(note)}
      />
    )
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
    cursorForceUpdate(selectChildren(this.props.note), this)
  }

  render() {
    return (
      <div className={cn('ml3')}>
        {_.map(childNote => (
          <F key={getNoteId(childNote)}>
            <NoteChild note={childNote} />
          </F>
        ))(selectChildren(this.props.note))}
      </div>
    )
  }
}
function NoteTree() {
  return (
    <F>
      <OnMount
        onMount={() => {
          focusNote(getRootNoteCursor(state))
        }}
      />
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        <NoteChild note={getRootNoteCursor(state)} />
      </div>
    </F>
  )
}

function Main() {
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
}

export default Main
