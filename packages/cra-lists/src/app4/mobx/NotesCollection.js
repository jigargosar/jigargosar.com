import {oJS, oObject, oSet, oValues} from './utils'
import nanoid from 'nanoid'

const R = require('ramda')
// const RA = require('ramda-adjunct')

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
  function create(snapshot = {}) {
    let notesCollection = oObject({
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
      addNewNote() {
        this.add(this.newNote())
      },
      get snapshot() {
        return oJS(this)
      },
    })
    R.map(notesCollection.put)(snapshot.idLookup || {})
    return notesCollection
  }

  return {create}
})()
