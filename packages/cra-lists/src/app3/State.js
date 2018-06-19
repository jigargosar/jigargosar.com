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

function State() {
  return m.observable.object(
    {
      fire: require('./Fire').Fire(),
    },
    {},
    {name: 'app3-state'},
  )
}

const state = State()

if (module.hot) {
  window.s = state
}

export default state
