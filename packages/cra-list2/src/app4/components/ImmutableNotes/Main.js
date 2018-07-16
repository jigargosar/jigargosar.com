import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, isAnyHotKey, isKey, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {_} from '../../little-ramda'
import Baobab from 'baobab'
import {
  appendNewSiblingNote,
  getChildrenCursor,
  getDebugId,
  getNoteId,
  getText,
  getTextCursor,
  onNoteTextChangeEvent,
  selectChildren,
} from '../../ImmutableState/ImmutableNote'
import {state} from '../../ImmutableState/ImmutableNoteTree'

if (module.hot) {
  window.Baobab = Baobab
}

function focusNewNote(newNote) {
  requestAnimationFrame(() => {
    const noteEl = document.getElementById(getNoteId(newNote))
    noteEl.focus()
  })
}

function cursorForceUpdate(textCursor, component) {
  textCursor.on('update', () => component.forceUpdate())
}

class NoteTextInput extends React.Component {
  get note() {
    return this.props.note
  }
  componentDidMount() {
    cursorForceUpdate(getTextCursor(this.note), this)
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
    _.cond([
      [
        isKey('enter'),
        () => focusNewNote(appendNewSiblingNote(note)),
      ],
      [isKey('down'), () => focusNewNote(note.right())],
    ])(e)
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
    cursorForceUpdate(getChildrenCursor(this.note), this)
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
