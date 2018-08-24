import {default as pQueue} from 'p-queue'
import {construct} from './exports-ramda'
export {default as delay} from 'delay'

export {default as pSeries} from 'p-series'
export {default as pEachSeries} from 'p-each-series'

export const PQueue = construct(pQueue)
