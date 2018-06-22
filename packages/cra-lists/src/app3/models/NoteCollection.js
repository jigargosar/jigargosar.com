/*eslint-disable*/

import {createTransformer, oArray, oObject} from '../o-util'

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

export function NoteCollection(initialList = []) {
  return oObject({list: oArray(initialList, {deep: true})})
}
const noteTransformer = vm => {
  validate('O', [vm])
  return createTransformer(note => {
    validate('O', [note])
    return oObject(
      {
        get isEditing() {
          return R.equals(vm._eid, note.id)
        },
        get text() {
          return this.isEditing ? vm._eText : note.text
        },
      },
      {},
      {name: 'NoteViewModel'},
    )
  })
}

export function NoteListViewModel(noteCollection = NoteCollection()) {
  validate('O', [noteCollection])
  return noteCollectionViewModelTransformer(noteCollection)
}

const noteCollectionViewModelTransformer = createTransformer(
  noteCollection => {
    validate('O', [noteCollection])
    return oObject(
      {
        _eid: null,
        _eText: null,
        _idAt(idx) {
          return R.pathOr(null, [idx, 'id'])(this.list.get(idx))
        },

        _propAt(idx, name) {
          return R.pathOr(null, [idx, name])(this.list.get(idx))
        },
        _textAt(idx) {
          return this._propAt(idx, 'text')
        },

        get _eIdx() {
          return R.find(R.propEq('id', this._eid))(this.list)
        },
        get list() {
          return R.compose(
            R.map(noteTransformer(this)),
            R.sortWith([
              R.ascend(R.prop('sortIdx')),
              R.descend(R.prop('createdAt')),
            ]),
            R.reject(R.propOr(false, 'deleted')),
            Array.from,
          )(noteCollection.list)
        },
        onEditTextChange(text) {
          validate('S', arguments)
          validate('S', this._eid)
          this._eText = text
        },
        _saveOrDeleteEdit() {
          validate('S', this._eid)
        },
        onEditPrev() {
          const clampListIdx = R.clamp(0, this.list.length - 1)
          const newIdx = clampListIdx(this._eIdx - 1)

          if (R.equals(newIdx, this._eIdx)) return

          const newEid = this._idAt(newIdx)
          const newEText = _textAt(newIdx)

          this._saveOrDeleteEdit()

          this._eid = newEid
          this._eText = newEText
        },
      },
      {},
      {name: 'NoteListViewModel'},
    )
  },
)
