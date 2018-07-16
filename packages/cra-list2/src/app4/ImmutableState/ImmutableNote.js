import {_, alwaysNothing, maybeOr, maybeOrElse} from '../little-ramda'
import Baobab, {Cursor} from 'baobab'
import nanoid from 'nanoid'
import {
  isCursorRoot,
  maybeDownIfExists,
  maybeLeft,
  maybeRight,
  maybeUp,
  maybeRightmostIfExists,
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

export function selectChildren(noteCursor) {
  return noteCursor.select('children')
}

export function selectText(noteCursor) {
  return noteCursor.select('text')
}

const ifRootThenNothingElse = _.ifElse(isCursorRoot)(alwaysNothing)

function maybeNextSiblingNote(note) {
  return ifRootThenNothingElse(maybeRight)(note)
}

function maybePreviousSiblingNote(note) {
  return ifRootThenNothingElse(maybeLeft)(note)
}

function maybeParentNote(note) {
  return _.compose(S.chain(maybeUp), maybeUp)(note)
}

function maybeFirstChildNote(note) {
  return maybeDownIfExists(selectChildren(note))
}

function maybeLastChildNote(note) {
  return _.compose(
    S.chain(maybeRightmostIfExists),
    maybeFirstChildNote,
  )(note)
}

export function maybeFirstVisibleChildOrNextNote(note) {
  return maybeOrElse(() => maybeNextNote(note))(
    maybeFirstChildNote(note),
  )

  function maybeNextNote(note) {
    return maybeOrElse(() =>
      S.chain(maybeNextNote)(maybeParentNote(note)),
    )(maybeNextSiblingNote(note))
  }
}

export function maybePreviousNote(note) {
  return _.compose(
    maybeOrElse(() => maybeParentNote(note)),
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
    const prev = maybePreviousNote(note)
    note.up().splice([_.last(note.path), 1])
    return prev
  })(note)
}
