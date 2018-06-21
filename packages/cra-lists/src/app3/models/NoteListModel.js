/*eslint-disable*/

import {oArray, oObject} from '../mobx-util'

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
  return oObject(
    {noteListModel, _eid: null},
    {},
    {name: 'NoteListViewModel'},
  )
}
