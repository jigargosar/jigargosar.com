/*eslint-disable*/

import {createTransformer, oArray, oObject} from '../o-util'
import {NoteListModel, NoteListViewModel} from './NoteListModel'

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

describe('NoteListModel', function() {
  it('should work', function() {
    NoteListViewModel(NoteListModel())
  })
})
