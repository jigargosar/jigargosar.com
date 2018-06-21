/*eslint-disable*/

import ow from 'ow'
import {SF} from '../../safe-fun'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')
var nanoid = require('nanoid')
const R = require('ramda')
const m = require('mobx')
const validate = require('aproba')
const RA = require('ramda-adjunct')
const RX = require('ramda-extension')

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
        return this._sortedList
      },
      get _values() {
        return Array.from(this._notes.values())
      },
      get listLength() {
        return this.list.length
      },
      get _sortedList() {
        return R.sortWith(
          [
            R.ascend(R.prop('sortIdx')),
            R.descend(R.prop('createdAt')),
          ],
          this._values,
        )
      },
      get(id) {
        return this._notes.get(id)
      },
      get _cRef() {
        return fire.store.createUserCollectionRef('notes')
      },
      get _isEditClean() {
        return R.equals(this._eText, this.get(this._eid).text)
      },
      _saveEditingNote: m.flow(function*() {
        if (this._isEditClean) return
        const text = this._eText
        const docRef = this._cRef.doc(this._eid)
        yield RX.isNilOrEmptyString(text)
          ? docRef.delete()
          : docRef.update({text})
        Object.assign(this, {
          _eid: null,
          _eText: null,
        })
      }),
      _saveNewNote(n) {
        return this._cRef.doc(n.id).set(n)
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
      startEditing() {
        if (R.isNil(this._eid) && this.listLength > 0) {
          this.onEdit(this.idAtIndex(0))
        }
      },
      _onPreEdit() {
        if (RA.isNotNil(this._eid)) {
          return this._saveEditingNote()
        }
      },
      onEdit: m.flow(function*(id) {
        yield this._onPreEdit()

        this._eid = id
        this._eText = this.get(id).text
      }),
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
      onEditInsertBelow() {
        ow(this._eid, ow.string.label('_eid').nonEmpty)
        this._insertNewAt(this._eIdx + 1)
      },
      add() {
        this._insertNewAt(0)
      },
      _insertNewAt: m.flow(function*(idx) {
        yield this._onPreEdit()
        const id = nanoid()
        const newNote = {
          id,
          text: `New Note`,
          sortIdx: idx,
          createdAt: Date.now(),
        }
        yield this._saveNewNote(newNote)
        yield R.compose(
          a => Promise.all(a),
          RA.mapIndexed((n, sortIdx) =>
            this._cRef.doc(n.id).update({sortIdx}),
          ),
          R.insert(idx, newNote),
        )(this.list)
        this.onEdit(id)
      }),
      _put(n) {
        ow(n, ow.object.label('note').hasKeys('id', 'text'))
        this._notes.set(n.id, n)
      },
      _updateNotesListFromFirestore(notes) {
        notes.forEach(n => this._put(n))
      },
      _onFirestoreDocChanges(docChanges) {
        docChanges.forEach(dc => {
          console.debug('_onFirestoreDocChanges: dc', dc)
          R.equals(dc.type, 'removed')
            ? this._notes.delete(dc.doc.id)
            : this._put(R.merge(dc.doc.data(), {id: dc.doc.id}))
        })
      },
    },
    {
      add: m.action.bound,
      _insertNewAt: m.action.bound,
      onEdit: m.action.bound,
      startEditing: m.action.bound,
      onEditTextChange: m.action.bound,
      onEditNext: m.action.bound,
      onEditInsertBelow: m.action.bound,
      onEditPrev: m.action.bound,
      _updateNotesListFromFirestore: m.action.bound,
      _onFirestoreDocChanges: m.action.bound,
    },
    {name: 'Notes'},
  )
  m.autorun(() => {
    if (fire.auth.isSignedIn) {
      fire.store.createUserCollectionRef('notes').onSnapshot(qs => {
        const documentChanges = qs.docChanges()
        notes._onFirestoreDocChanges(documentChanges)
        // const docs = documentChanges.map(dc =>
        //   R.merge(dc.doc.data(), {id: dc.doc.id}),
        // )
        // notes._updateNotesListFromFirestore(docs)
      })
    }
  })

  function addWindowKeyEventListener() {
    window.addEventListener('keydown', e => {
      console.debug('window.keydown', e)
      if (e.target instanceof window.HTMLInputElement) return
      if (RX.startsWithPrefix('Arrow', e.key)) {
        notes.startEditing()
      } else if (R.equals('a', e.key)) {
        notes.add()
      }
    })
  }

  if (!module.hot || !module.hot.data) {
    addWindowKeyEventListener()
  }
  return notes
}

export default Notes
