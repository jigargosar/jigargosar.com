/*eslint-disable*/

import {createTransformer} from 'mobx-utils'

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')

const R = require('ramda')
const m = require('mobx')
const mst = require('mobx-state-tree')
const validate = require('aproba')
const RA = require('ramda-adjunct')
const RX = require('ramda-extension')

/*eslint-enable*/

export const oObject = m.observable.object
export const extendObservable = m.extendObservable
export const oArray = m.observable.array
export const oMap = m.observable.map
export const mSet = m.set
export const mValues = m.values
export const mAutoRun = m.autorun
export const mReaction = m.reaction
export const mTrace = m.trace
export const mJS = m.toJS
export const mIntercept = m.intercept
export const mActionBound = m.action.bound
export const t = mst.types
export const tModel = mst.types.model
export const tMap = mst.types.map
export {createTransformer, createViewModel} from 'mobx-utils'
