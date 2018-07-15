import {_} from '../little-ramda'
import Baobab, {Cursor} from 'baobab'
import nanoid from 'nanoid'

export function createNote({text = ''}) {
  return {id: `Note-${nanoid()}`, text, children: []}
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

export function getChildren({children}) {
  return children
}

export function getWhenCursor(note) {
  return note instanceof Baobab || note instanceof Cursor
    ? note.get()
    : note
}

export function getText(note) {
  const {text} = getWhenCursor(note)
  return text
}

export function setText(text, noteCursor) {
  return noteCursor.set('text', text)
}

export function onNoteTextChangeEvent(noteCursor) {
  return function(e) {
    return setText(e.target.value, noteCursor)
  }
}

export function getDisplayText(note) {
  return `${getDebugId(note)} - ${getText(note)}`
}

export function getDebugId(note) {
  const {id} = getWhenCursor(note)
  const start = 5
  return id.slice(start, start + 3)
}

export function selectChildren(note) {
  return note.select('children')
}

export function getTextCursor(note) {
  return note.select('text')
}

export const appendTwoChildren = (() => {
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
export const initialRoot = appendTwoChildren(
  createNote({text: 'Tree Root'}),
)
