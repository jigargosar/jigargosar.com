import {_, alwaysNothing, maybeOr, maybeOrElse} from '../little-ramda'
import Baobab, {Cursor} from 'baobab'
import nanoid from 'nanoid'
import {
  maybeDownIfExists,
  maybeLeft,
  maybeRight,
  maybeRightmostIfExists,
  maybeUp,
} from './functional-baobab'
import S from 'sanctuary'

export const initialNoteTree = (() => {
  const appendTwoChildren = (() => {
    const secondChild = appendNewNotes([
      {text: 'fourth grand child'},
      {text: 'third grand child'},
    ])(createNote({text: 'second child'}))

    const firstChild = appendNewNotes([
      {text: 'second grand child'},
      {text: 'first grand child'},
    ])(createNote({text: 'first child'}))
    return appendNotes([firstChild, secondChild])
  })()

  return appendTwoChildren(createNote({text: 'Tree Root'}))

  function appendNote(child) {
    return function(note) {
      return _.assoc('children')(_.append(child, note.children))(note)
    }
  }
  function appendNotes(children) {
    return function(note) {
      return _.reduce((note, child) => appendNote(child)(note))(note)(
        children,
      )
    }
  }
  function appendNewNote(noteProps) {
    return function(note) {
      return appendNote(createNote(noteProps))(note)
    }
  }
  function appendNewNotes(notePropsList) {
    return function(note) {
      return _.reduce((note, noteProps) =>
        appendNewNote(noteProps)(note),
      )(note)(notePropsList)
    }
  }
})()

function createNote({text = ''} = {}) {
  return {
    id: `Note-${nanoid()}`,
    text,
    children: [],
    collapsed: false,
  }
}
export function preProcessNote({
  id = `Note-${nanoid()}`,
  text,
  children = [],
  collapsed = false,
} = {}) {
  return {
    id,
    text,
    children: _.map(preProcessNote)(children),
    collapsed,
  }
}

export function whenCursorGet(note) {
  return note instanceof Baobab || note instanceof Cursor
    ? note.get()
    : note
}

export function getNoteText(note) {
  const {text} = whenCursorGet(note)
  return text
}

export function getDebugId(note) {
  const {id} = whenCursorGet(note)
  const start = 5
  return id.slice(start, start + 3)
}

export function getChildren(noteOrCursor) {
  const {children} = whenCursorGet(noteOrCursor)
  return children
}

function getNoteChildCount(noteOrCursor) {
  return getChildren(noteOrCursor).length
}

export function getNoteTextLength(note) {
  return getNoteText(note).length
}

export function noteHasChildren(noteOrCursor) {
  return getNoteChildCount(noteOrCursor) > 0
}

export function getNoteId(note) {
  const {id} = whenCursorGet(note)
  return id
}

export function setNoteText(text, noteCursor) {
  noteCursor.set('text', text)
  return noteCursor
}

export function appendNewSiblingNote(noteCursor) {
  const newNote = createNote()
  noteCursor.up().splice([_.last(noteCursor.path) + 1, 0, newNote])
  return newNote
}

export function appendSiblingNote(note, noteCursor) {
  noteCursor.up().splice([_.last(noteCursor.path) + 1, 0, note])
  return noteCursor
}

export function appendChildNote(noteData, noteCursor) {
  const insertIdx = getNoteChildCount(noteCursor)
  selectChildren(noteCursor).splice([insertIdx, 0, noteData])
  return noteCursor
}

export function selectChildren(noteCursor) {
  return noteCursor.select('children')
}

function isCurrentRootNote(noteCursor) {
  return _.equals(
    noteCursor.root().get('rootNotePath'),
    noteCursor.path,
  )
}

const ifRootThenNothingElse = _.ifElse(isCurrentRootNote)(
  alwaysNothing,
)

function maybeNextSiblingNote(note) {
  return ifRootThenNothingElse(maybeRight)(note)
}

export function maybePreviousSiblingNote(note) {
  return ifRootThenNothingElse(maybeLeft)(note)
}

export function maybeGetParentNote(note) {
  return _.compose(S.chain(maybeUp), maybeUp)(note)
}

export function maybeParentButNotRootNote(note) {
  return _.compose(
    S.chain(_.ifElse(isCurrentRootNote, alwaysNothing, S.Just)),
    maybeGetParentNote,
  )(note)
}

function maybeFirstVisibleChildNote(note) {
  return doesNoteHaveVisibleChildren(note)
    ? maybeDownIfExists(selectChildren(note))
    : S.Nothing
}

function maybeLastChildNote(note) {
  return _.compose(
    S.chain(maybeRightmostIfExists),
    maybeFirstVisibleChildNote,
  )(note)
}

export function maybeGetFirstVisibleChildOrNextNote(note) {
  return maybeOrElse(() => maybeNextNote(note))(
    maybeFirstVisibleChildNote(note),
  )

  function maybeNextNote(note) {
    return maybeOrElse(() =>
      S.chain(maybeNextNote)(maybeGetParentNote(note)),
    )(maybeNextSiblingNote(note))
  }
}

export function maybeGetPreviousNote(note) {
  return _.compose(
    maybeOrElse(() => maybeGetParentNote(note)),
    S.map(lastVisibleLeafNoteOrSelf),
  )(maybePreviousSiblingNote(note))

  function lastVisibleLeafNoteOrSelf(note) {
    return _.compose(
      maybeOr(note),
      S.map(lastVisibleLeafNoteOrSelf),
      maybeLastChildNote,
    )(note)
  }
}

export function deleteAndGetMaybePreviousNote(note) {
  return ifRootThenNothingElse(note => {
    const prev = maybeGetPreviousNote(note)
    note.up().splice([_.last(note.path), 1])
    return prev
  })(note)
}

export function appendNoteText(text, note) {
  return setNoteText(`${getNoteText(note)}${text}`, note)
}

function setNoteCollapsed(collapsed, noteCursor) {
  noteCursor.set('collapsed', collapsed)
  return noteCursor
}

export function collapseNote(noteCursor) {
  return noteHasChildren(noteCursor)
    ? setNoteCollapsed(true, noteCursor)
    : noteCursor
}

export function expandNote(noteCursor) {
  return setNoteCollapsed(false, noteCursor)
}

export function isNoteCollapsed(noteCursor) {
  return noteCursor.get('collapsed')
}

export function isNoteExpanded(noteCursor) {
  return !isNoteCollapsed(noteCursor)
}

export function doesNoteHaveVisibleChildren(noteCursor) {
  return isNoteExpanded(noteCursor) && noteHasChildren(noteCursor)
}
