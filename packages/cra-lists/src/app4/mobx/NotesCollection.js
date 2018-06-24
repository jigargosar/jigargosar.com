import {
  mActionBound,
  mSet,
  mSnapshot,
  mValues,
  oObject,
} from './utils'
import {nanoid} from '../model/util'
import Chance from 'chance'

const R = require('ramda')
// const RA = require('ramda-adjunct')

export const Note = (function Note() {
  function create({id, text, deleted, sortIdx}) {
    return oObject({
      id,
      text,
      deleted,
      sortIdx,
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

export const chance = new Chance()

export const NotesCollection = (function NotesCollection() {
  function create(snapshot = {}) {
    return oObject(
      {
        idLookup: oObject(
          R.compose(R.map(Note.create), R.propOr({}, 'idLookup'))(
            snapshot,
          ),
        ),
        get all() {
          return mValues(this.idLookup)
        },
        newNote({sortIdx = 0} = {}) {
          const id = nanoid()
          return Note.create({
            id,
            text: '',
            deleted: false,
            sortIdx,
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
          return mSnapshot(this)
        },
      },
      {put: mActionBound},
      {name: 'notesCollection'},
    )
  }

  return {create}
})()
