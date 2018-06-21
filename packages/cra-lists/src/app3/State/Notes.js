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
      // _eIdx: -1,
      // get _eid() {
      //   return R.path(['list', this._eIdx, 'id'], this)
      // },
      //
      // set _eid(id) {
      //   this._eIdx = R.findIndex(R.propEq('id', id), this.list)
      //   // we have to set _eText, etc.
      // },
      _notes: m.observable.map([], {deep: false}),
      get list() {
        return Array.from(this._notes.values())
      },
      get listLength() {
        return this.list.length
      },
      get _sortedList() {
        return R.sortBy(R.prop('text'), this.list)
      },
      get(id) {
        return this._notes.get(id)
      },
      get _cRef() {
        return fire.store.createUserCollectionRef('notes')
      },
      _saveEditingNote() {
        this._cRef
          .doc(this._eid)
          .update({text: this._eText})
          .catch(console.error)
        Object.assign(this, {
          _eid: null,
          _eText: null,
        })
      },
      _saveNewNote(n) {
        return this._cRef.doc(n.id).set({text: n.text})
      },
      _eid: null,
      _eText: null,
      get _eIdx() {
        return R.findIndex(R.propEq('id', this._eid), this.list)
      },
      get editText() {
        return this._eText
      },
      idAtIndex(i) {
        return this.list[i].id
      },
      isEditing(id) {
        return R.equals(this._eid, id)
      },
      onEdit(id) {
        if (RA.isNotNil(this._eid)) {
          this._saveEditingNote()
        }

        this._eid = id
        this._eText = this.get(id).text
      },
      onEditTextChange(val) {
        validate('S', arguments)
        ow(this._eid, ow.string.label('_eid').nonEmpty)
        this._eText = val
      },
      onEditPrev() {
        ow(this._eid, ow.string.label('_eid').nonEmpty)
        const prevIdx = this._eIdx - 1
        if (prevIdx >= 0) {
          this.onEdit(this.idAtIndex(prevIdx))
        }
      },
      onEditNext() {
        ow(this._eid, ow.string.label('_eid').nonEmpty)
        const nextIdx = this._eIdx + 1
        if (nextIdx < this.listLength) {
          this.onEdit(this.idAtIndex(nextIdx))
        }
      },
      add: m.flow(function*() {
        yield this._saveNewNote({
          id: nanoid(),
          text: `New Note`,
        })
      }),
      _put(n) {
        ow(n, ow.object.label('note').hasKeys('id', 'text'))
        this._notes.set(n.id, n)
      },
      _updateNotesListFromFirestore(notes) {
        notes.forEach(n => this._put(n))
      },
    },
    {
      add: m.action.bound,
      onEdit: m.action.bound,
      onEditTextChange: m.action.bound,
      onEditNext: m.action.bound,
      onEditPrev: m.action.bound,
      _updateNotesListFromFirestore: m.action.bound,
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
