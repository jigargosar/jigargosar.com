/*eslint-disable*/

import {createNewNote, NoteListViewModel} from './NoteCollection'
import {oJS} from '../o-util'

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

describe('NoteCollection', () => {
  it('should have empty .list', () => {
    expect(NoteListViewModel().list).toEqual([])
  })
})

describe('Note', () => {
  it('should createNewNote', () => {
    const note = createNewNote()

    expect(oJS(note)).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Number),
      sortIdx: 0,
      text: '',
    })
  })
})
