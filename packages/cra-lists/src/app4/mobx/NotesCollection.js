import {oObject, oSet, oValues} from './utils'
import nanoid from 'nanoid'

export const Note = (function Note() {
  function create({id, text, deleted}) {
    return oObject({
      id,
      text,
      deleted,
      get all() {
        return oValues(this.idLookup)
      },
      toggleDeleted() {
        this.deleted = !this.deleted
      },
    })
  }
  return {create}
})()

export const NotesCollection = (function NotesCollection() {
  function create() {
    return oObject({
      idLookup: oObject({}),
      get all() {
        return oValues(this.idLookup)
      },
      newNote() {
        const id = nanoid()
        return Note.create({
          id,
          text: `Note Text : id:${id}`,
          deleted: false,
        })
      },
      put(note) {
        oSet(this.idLookup, note.id, note)
      },
      add(note) {
        this.put(note)
      },
    })
  }

  return {create}
})()
