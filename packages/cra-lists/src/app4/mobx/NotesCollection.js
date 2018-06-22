import {t} from './utils'

export const Note = t.model({
  id: t.identifier(t.string),
  text: t.string,
})

export const NotesCollection = t.model({
  idLookup: t.optional(t.map(Note), {}),
})
