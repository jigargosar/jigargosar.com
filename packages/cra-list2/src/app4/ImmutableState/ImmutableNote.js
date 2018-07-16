import {_} from '../little-ramda'
import Baobab, {Cursor} from 'baobab'
import nanoid from 'nanoid'

export function createNote({text = ''} = {}) {
  return {
    id: `Note-${nanoid()}`,
    text,
    children: [],
    collapsed: false,
  }
}

export function appendNote(child) {
  return function(note) {
    return _.assoc('children')(_.append(child, note.children))(note)
  }
}

export function appendNotes(children) {
  return function(note) {
    return _.reduce((note, child) => appendNote(child)(note))(note)(
      children,
    )
  }
}

export function appendNewNote(noteProps) {
  return function(note) {
    return appendNote(createNote(noteProps))(note)
  }
}

export function appendNewNotes(notePropsList) {
  return function(note) {
    return _.reduce((note, noteProps) =>
      appendNewNote(noteProps)(note),
    )(note)(notePropsList)
  }
}

export function whenCursorGet(note) {
  return note instanceof Baobab || note instanceof Cursor
    ? note.get()
    : note
}

export function getText(note) {
  const {text} = whenCursorGet(note)
  return text
}

export function setText(text, noteCursor) {
  noteCursor.set('text', text)
  return noteCursor
}

export function onNoteTextChangeEvent(noteCursor) {
  return function(e) {
    return setText(e.target.value, noteCursor)
  }
}

export function appendNewSiblingNote(noteCursor) {
  const newNote = createNote()
  noteCursor.up().splice([_.last(noteCursor.path) + 1, 0, newNote])
  return newNote
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

export function selectChildren(noteCursor) {
  return noteCursor.select('children')
}

export function selectText(noteCursor) {
  return noteCursor.select('text')
}

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

export const initialNoteTree = appendTwoChildren(
  createNote({text: 'Tree Root'}),
)
