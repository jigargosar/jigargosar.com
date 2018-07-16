import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, mrInjectAll, whenKey, withKeyEvent} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {
  _,
  alwaysNothing,
  maybeOrElse,
  S,
  validate,
} from '../../little-ramda'
import Baobab from 'baobab'
import {
  appendNewSiblingNote,
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
  maybeRight,
  maybeUp,
} from './functional-baobab'

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

function maybeParentNote(note) {
  const newVar = _.compose(S.chain(maybeUp), maybeUp)(note)
  console.log(`newVar.value.get()`, newVar.value.get())
  return newVar
}

function maybeFirstChildNote(note) {
  return maybeDownIfExists(note.select('children'))
}

const maybeNextNote = n =>
  maybeOrElse(() => S.chain(maybeNextNote)(maybeParentNote(n)))(
    maybeNextSiblingNote(n),
  )

function maybeFirstChildOrNextNote(note) {
  return maybeOrElse(() => maybeNextNote(note))(
    maybeFirstChildNote(note),
  )
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
        maybeFocusNote(maybeFirstChildOrNextNote(note)),
      ),
      whenKey('up')(() => focusNote(note.left())),
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

class NoteTree extends React.Component {
  componentDidMount() {
    focusNote(state.tree)
  }

  render = () => (
    <F>
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        <NoteChild note={state.tree} />
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
