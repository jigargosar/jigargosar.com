/*eslint-disable*/

import {createTransformer} from "mobx-utils";

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')
var nanoid = require('nanoid')
const R = require('ramda')
const m = require('mobx')
const mst = require('mobx-state-tree')
const validate = require('aproba')
const RA = require('ramda-adjunct')
const RX = require('ramda-extension')

/*eslint-enable*/

export const oObject = m.observable.object
export const oArray = m.observable.array
export const oMap = m.observable.map
export const oSet = m.set
export const oValues = m.values
export const autoRun = m.autorun
export const oJS = m.toJS
export const t = mst.types
export const tModel = mst.types.model
export const tMap = mst.types.map
export {createTransformer} from 'mobx-utils'
