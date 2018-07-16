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
  getNoteText,
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

function focusNote(note, selection = null) {
  const n = whenCursorGet(note)
  validate('O', [n])
  requestAnimationFrame(() => {
    const noteEl = document.getElementById(getNoteId(note))
    noteEl.focus()
    if (selection) {
      noteEl.setSelectionRange(selection.start, selection.end)
    }
  })
  return note
}

function maybeFocusNote(maybeNote) {
  return S.map(focusNote)(maybeNote)
}

function cursorForceUpdate(textCursor, component) {
  textCursor.on('update', () => component.forceUpdate())
}

function getSelectionFromEvent(e) {
  return {start: e.target.selectionStart, end: e.target.selectionEnd}
}

function isSelectionAtStart(selectionRange) {
  return selectionRange.start === 0 && selectionRange.end === 0
}

function focusPreviousNote(note) {
  return maybeFocusNote(maybePreviousNote(note))
}

function appendNoteText(deletedText, prev) {
  return setNoteText(`${getNoteText(prev)}${deletedText}`, prev)
}

function getNoteTextLength(prev) {
  return getNoteText(prev).length
}

function createSelection(start, end = start) {
  return {start, end}
}

const onNoteInputKeyDown = note => {
  return withKeyEvent(
    whenKey('enter')(() => focusNote(appendNewSiblingNote(note))),
    whenKey('backspace')(onBackspaceKeyDown),
    whenKey('down')(() =>
      maybeFocusNote(maybeFirstVisibleChildOrNextNote(note)),
    ),
    whenKey('up')(() => focusPreviousNote(note)),
  )
  function onBackspaceKeyDown(e) {
    const selection = getSelectionFromEvent(e)
    if (isSelectionAtStart(selection)) {
      const deletedText = getNoteText(note)
      const maybePrev = deleteAndGetMaybePreviousNote(note)
      S.map(prev =>
        focusNote(
          appendNoteText(deletedText, prev),
          createSelection(getNoteTextLength(prev)),
        ),
      )(maybePrev)
    }
  }
}

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
        value={getNoteText(note)}
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
