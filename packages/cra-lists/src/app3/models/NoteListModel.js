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

export function NoteListModel(initialList = []) {
  return oObject(
    {
      list: oArray(initialList),
    },
    {},
    {name: 'NoteListModel'},
  )
}

export function NoteListViewModel(noteListModel) {
  const vm = oObject(
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
        return listTransFormer(noteListModel.list)
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
        // todo: save prev editing

        this._saveOrDeleteEdit()

        this._eid = newEid
        this._eText = newEText
      },
    },
    {},
    {name: 'NoteListViewModel'},
  )

  // m.observe(vm, '_eid', ({oldValue}) => {
  //   console.log('old', oldValue, 'new', vm._eid)
  // })

  const listTransFormer = createTransformer(list => {
    return oArray(
      R.compose(
        map(noteTransformer),
        R.sortWith([
          R.ascend(R.prop('sortIdx')),
          R.descend(R.prop('createdAt')),
        ]),
        R.reject(R.propOr(false, 'deleted')),
        Array.from,
      )(list),
    )
  })
  const noteTransformer = createTransformer(note => {
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
  return vm
}
