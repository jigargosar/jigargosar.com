/*eslint-disable*/
import ow from 'ow'
import * as mu from 'mobx-utils/lib/mobx-utils'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')
const R = require('ramda')
const m = require('mobx')
const validate = require('aproba')
const RA = require('ramda-adjunct')

/*eslint-enable*/

function Notes(fire) {
  return m.observable.object(
    {
      _notes: m.observable.map([], {deep: false}),
      get list() {
        return this._notes
      },
      get add() {
        return this._notes.push({text: `New Note`})
      },
    },
    {},
    {name: 'Notes'},
  )
}

export default Notes
