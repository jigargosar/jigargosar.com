/*eslint-disable*/

import ow from 'ow'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')
var nanoid = require('nanoid')
const R = require('ramda')
const m = require('mobx')
const validate = require('aproba')
const RA = require('ramda-adjunct')

/*eslint-enable*/

function Notes(fire) {
  const notes = m.observable.object(
    {
      _notes: m.observable.map([], {deep: false}),
      _editingNoteId: null,
      onEdit(id) {
        this._editingNoteId = id
      },
      idAtIndex(i) {
        return this.list[i].id
      },
      get _indexOfEditingNoteId() {
        return R.findIndex(
          R.propEq('id', this._editingNoteId),
          this.list,
        )
      },
      onEditPrev() {
        ow(
          this._editingNoteId,
          ow.string.label('_editingNoteId').nonEmpty,
        )
        const prevIdx = this._indexOfEditingNoteId - 1
        if (prevIdx >= 0) {
          this._editingNoteId = this.idAtIndex(prevIdx)
        }
      },
      onEditNext() {
        ow(
          this._editingNoteId,
          ow.string.label('_editingNoteId').nonEmpty,
        )
        const nextIdx = this._indexOfEditingNoteId + 1
        if (nextIdx < this.listLength) {
          this._editingNoteId = this.idAtIndex(nextIdx)
        }
      },
      isEditing(id) {
        return R.equals(this._editingNoteId, id)
      },
      get list() {
        return Array.from(this._notes.values())
      },
      get listLength() {
        return this.list.length
      },
      add() {
        return this._put({id: nanoid(), text: `New Note`})
      },
      _put(n) {
        ow(n, ow.object.label('note').hasKeys('id', 'text'))
        this._notes.set(n.id, n)
      },
      _updateNotesListFromFirestore(notes) {
        notes.forEach(this._put)
      },
    },
    {
      add: m.action.bound,
      onEdit: m.action.bound,
      onEditNext: m.action.bound,
      onEditPrev: m.action.bound,
      _updateNotesListFromFirestore: m.action.bound,
      _put: m.action.bound,
    },
    {name: 'Notes'},
  )
  m.autorun(() => {
    if (fire.auth.isSignedIn) {
      fire.store.createUserCollectionRef('notes').onSnapshot(qs => {
        const docs = qs
          .docChanges()
          .map(dc => R.merge(dc.doc.data(), {id: dc.doc.id}))
        notes._updateNotesListFromFirestore(docs)
      })
    }
  })
  return notes
}

export default Notes
