import {mActionBound, mJS, mSet, mValues, oObject} from './utils'
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
        return mValues(this.idLookup)
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
    return oObject(
      {
        idLookup: oObject(
          R.compose(R.map(Note.create), R.propOr('idLookup', {}))(
            snapshot,
          ),
        ),
        get all() {
          return mValues(this.idLookup)
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
          mSet(this.idLookup, note.id, note)
        },
        add(note) {
          this.put(note)
        },
        addNewNote() {
          this.add(this.newNote())
        },
        get snapshot() {
          return mJS(this)
        },
      },
      {put: mActionBound},
      {name: 'notesCollection'},
    )
  }

  return {create}
})()
