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

const sortSpecifier = (attribute, order) => ({
  kind: 'attribute',
  attribute,
  order,
})

export const asc = attribute => sortSpecifier(attribute, 'ascending')
export const dsc = attribute => sortSpecifier(attribute, 'descending')

export function replaceRecordOP(record) {
  return t => t.replaceRecord(record)
}
