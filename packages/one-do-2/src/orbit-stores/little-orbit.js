import {curry} from '../lib/ramda'

export const addRecord = curry(function addRecord(record, t) {
  return t.addRecord(record)
})
