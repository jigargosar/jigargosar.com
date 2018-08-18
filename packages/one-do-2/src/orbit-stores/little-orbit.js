import {map} from 'ramda'
import {prettyStringifySafe} from '../lib/little-ramda'
import {compose, tap} from '../lib/ramda'

const flattenRecord = ({attributes, ...rest}) => ({
  ...rest,
  ...attributes,
})

export function logRecords(records) {
  const flatRecords = map(flattenRecord)(records)
  console.table(flatRecords)
  console.debug(prettyStringifySafe(records))
}

export const tapLogRecords = compose(tap, logRecords)

export const findRecords = type => store =>
  store.query(q => q.findRecords(type))
