import {t} from './utils'
import nanoid from 'nanoid'

export const Note = t.model({
  id: t.identifier(t.string),
  text: t.string,
})

export const NotesCollection = t
  .model({
    idLookup: t.optional(t.map(Note), {}),
  })
  .views(self => ({
    get all() {
      return Array.from(self.idLookup.values())
    },
  }))
  .actions(self => ({
    newNote() {
      const id = nanoid()
      return Note.create({id, text: `Note Text : id:${id}`})
    },

    add(note) {
      return self.idLookup.put(note)
    },
  }))
