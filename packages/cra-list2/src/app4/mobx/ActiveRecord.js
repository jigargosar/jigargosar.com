import {
  createObservableObject,
  extendObservableObject,
  oObject,
} from './utils'
import {nanoid} from '../model/util'
import {upsert} from '../model/upsert'
import {_, validate} from '../utils'
import a from 'nanoassert'

import pluralize from 'pluralize'

const FieldTypeToDefaultValueLookup = {
  string: '',
  text: '',
  bool: false,
}
const FieldTypes = _.keys(FieldTypeToDefaultValueLookup)

function typeNameToValue(type) {
  validate('S', [type])
  a(_.contains(type, FieldTypes))
  return FieldTypeToDefaultValueLookup[type]
}

function fieldToProp(field) {
  validate('S', [field])
  const [name, type] = _.split(':', field)
  validate('SS', [name, type])
  return {[name]: typeNameToValue(type)}
}

function fieldsToProps(fields) {
  validate('A', [fields])
  return _.compose(_.mergeAll, _.map(fieldToProp))(fields)
}

function fieldToName(field) {
  validate('S', [field])
  const [name, type] = _.split(':', field)
  validate('SS', [name, type])
  return name
}

function fieldsToNames(fields) {
  validate('A', [fields])
  return _.map(fieldToName, fields)
}

export function ActiveRecord({fields, name}) {
  validate('AS', [fields, name])
  const activeRecord = createObservableObject({
    props: {
      fields,
      name,
    },
    actions: {
      new() {
        const id = nanoid()
        const props = fieldsToProps(fields)
        console.log('props', props)
        return createObservableObject({
          props: {
            id,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            ...props,
            toJSON() {
              return _.pick(
                [
                  'id',
                  'createdAt',
                  'modifiedAt',
                  ...fieldsToNames(fields),
                ],
                this,
              )
            },
          },
          actions: {},
          name: `${name}@${id}`,
        })
      },
    },
    name: pluralize.plural(name),
  })
  return activeRecord
}
