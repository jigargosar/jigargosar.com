import {map} from 'ramda'
import {prettyJSONStringify} from '../lib/little-ramda'
import {fromPromise} from '../lib/mobx-utils'

const flattenRecord = ({attributes, ...rest}) => ({
  ...rest,
  ...attributes,
})

export function logRecords(records) {
  const flatRecords = map(flattenRecord)(records)
  console.table(flatRecords)
  console.debug(prettyJSONStringify(records))
}

export const findAllRecordsOfType = type => store =>
  fromPromise(store.query(q => q.findRecords(type)))
