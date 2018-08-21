import {
  _path,
  _prop,
  compose,
  curry,
  keys,
  map,
  pick,
  tap,
  toPairs,
} from '../lib/ramda'
import {prettyStringifySafe, validate} from '../lib/little-ramda'

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

export function replaceAttributeOP(recordOrRId, name, value) {
  validate('OS', [recordOrRId, name])

  const recordIdentity = recordToRId(recordOrRId)

  return t => t.replaceAttribute(recordIdentity, name, value)
}

export const validateRecordIdentity = ({id, type}) => {
  validate('SS', [id, type])
}

export const recordToRId = compose(
  tap(validateRecordIdentity),
  pick(['id', 'type']),
)

export const recAttr = name => _path(['attributes', name])

export const removeRecordOP = curry((recordOrRId, t) =>
  t.removeRecord(recordToRId(recordOrRId)),
)

export function typeOfRecord(record) {
  validate('O', [record])
  const type = record.type
  validate('S', [type])
  return type
}

export const modelDefOfType = type => schema => {
  const modelDesc = _path(['models', type])(schema)
  validate('SOO', [type, schema, modelDesc])
  return modelDesc
}
export const getModelTypes = compose(keys, _prop('models'))

export const attributesOfType = type => schema =>
  compose(toPairs, _prop('attributes'), modelDefOfType(type))(schema)
