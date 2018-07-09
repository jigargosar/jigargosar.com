import {createObservableObject} from './utils'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'

import pluralize from 'pluralize'

function createProps({defaultValues, fieldNames}) {
  validate('OA', [defaultValues, fieldNames])

  const props = _.compose(
    _.mergeAll,
    _.map(propName => ({
      [propName]: _.defaultTo(null, defaultValues[propName]),
    })),
  )(fieldNames)
  validate('O', [props])
  return props
}

function createRecord({defaultValues, fieldNames, name}) {
  const id = nanoid()
  const props = createProps({defaultValues, fieldNames})

  return createObservableObject({
    props: {
      id,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      ...props,
      toJSON() {
        return _.pickAll(
          ['id', 'createdAt', 'modifiedAt', ...fieldNames],
          this,
        )
      },
    },
    actions: {},
    name: `${name}@${id}`,
  })
}

export function ActiveRecord({fieldNames, name}) {
  validate('AS', [fieldNames, name])
  const activeRecord = createObservableObject({
    props: {
      fieldNames,
      name,
    },
    actions: {
      new(defaultValues = {}) {
        return createRecord({defaultValues, fieldNames, name})
      },
      findAll() {
        return []
      },
    },
    name: ` ActiveRecord${pluralize.plural(name)}`,
  })
  return activeRecord
}
