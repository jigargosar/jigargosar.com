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
  function create(json) {
    const js = JSON.parse(json)
    return oObject({
      idLookup: oObject(js.idLookup || {}),
      get all() {
        return oValues(this.idLookup)
      },
      newNote() {
        const id = nanoid()
        return Note.create({
          id,
          text: `NTTTT : id:${id}`,
          deleted: false,
        })
      },
      put(note) {
        oSet(this.idLookup, note.id, note)
      },
      add(note) {
        this.put(note)
      },

      addNewNote() {
        this.add(this.newNote())
      },
    })
  }

  return {create}
})()
