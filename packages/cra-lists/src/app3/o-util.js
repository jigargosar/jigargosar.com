/*eslint-disable*/

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')
var nanoid = require('nanoid')
const R = require('ramda')
const m = require('mobx')
const mu = require('mobx-utils')
const validate = require('aproba')
const RA = require('ramda-adjunct')
const RX = require('ramda-extension')

/*eslint-enable*/

export const oObject = m.observable.object
export const oArray = m.observable.array
export const createTransformer = mu.createTransformer
