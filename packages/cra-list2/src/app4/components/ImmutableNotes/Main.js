import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {
  cn,
  createSelection,
  F,
  getSelectionFromEvent,
  isSelectionAtStart,
  setFocusAndSelectionOnDOMId,
  whenKey,
  withKeyEvent,
  wrapPD,
} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'

import {_, validate} from '../../little-ramda'
import Baobab from 'baobab'
import {
  appendChildNote,
  appendNewSiblingNote,
  appendNoteText,
  appendSiblingNote,
  collapseNote,
  deleteAndGetMaybePreviousNote,
  getDebugId,
  getNoteId,
  getNoteText,
  getNoteTextLength,
  maybeGetFirstVisibleChildOrNextNote,
  maybeGetPreviousNote,
  maybeParentButNotRootNote,
  maybePreviousSiblingNote,
  noteHasChildren,
  selectChildren,
  selectText,
  setNoteText,
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
  const domId = getNoteId(note)
  validate('S', [domId])
  setFocusAndSelectionOnDOMId(domId, selection)
  return note
}

function focusNoteWithSelectionFromEvent(e) {
  return function(note) {
    return focusNote(note, getSelectionFromEvent(e))
  }
}

function cursorForceUpdate(textCursor, component) {
  textCursor.on('update', () => component.forceUpdate())
}

const onNoteInputKeyDown = note => {
  return withKeyEvent(
    whenKey('enter')(() => focusNote(appendNewSiblingNote(note))),
    whenKey('backspace')(onBackspaceKeyDown),
    whenKey('tab')(wrapPD(indentNote)),
    whenKey('shift+tab')(wrapPD(unIndentNote)),
    whenKey('down')(wrapPD(navigateToNextNote)),
    whenKey('up')(wrapPD(navigateToPreviousNote)),
    whenKey('shift+up')(
      wrapPD(() => {
        collapseNote(note)
      }),
    ),
  )

  function navigateToPreviousNote(e) {
    return S.map(focusNoteWithSelectionFromEvent(e))(
      maybeGetPreviousNote(note),
    )
  }

  function navigateToNextNote(e) {
    return S.map(focusNoteWithSelectionFromEvent(e))(
      maybeGetFirstVisibleChildOrNextNote(note),
    )
  }

  function unIndentNote(e) {
    S.map(parent => {
      const noteData = note.get()
      deleteAndGetMaybePreviousNote(note)
      appendSiblingNote(noteData, parent)
      return focusNote(noteData, getSelectionFromEvent(e))
    })(maybeParentButNotRootNote(note))
  }

  function indentNote(e) {
    S.map(prev => {
      const noteData = note.get()
      deleteAndGetMaybePreviousNote(note)
      appendChildNote(noteData, prev)
      return focusNote(noteData, getSelectionFromEvent(e))
    })(maybePreviousSiblingNote(note))
  }

  function onBackspaceKeyDown(e) {
    const selection = getSelectionFromEvent(e)
    if (isSelectionAtStart(selection) && !noteHasChildren(note)) {
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
        className={cn('flex-auto', 'ma0 pv2 bw0 outline-0')}
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
          'bb bw1 b--light-gray',
        )}
      >
        <div className={cn('f6 gray mr3', 'dn')}>
          {getDebugId(note)}
        </div>
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
