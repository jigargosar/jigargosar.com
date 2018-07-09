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

export function ActiveRecord({fieldNames, name}) {
  validate('AS', [fieldNames, name])
  const activeRecord = createObservableObject({
    props: {
      fieldNames,
      name,
    },
    actions: {
      new(defaultValues = {}) {
        const id = nanoid()

        const props = createProps({defaultValues, fieldNames})

        // console.log(`props`, props)

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
      },
    },
    name: pluralize.plural(name),
  })
  return activeRecord
}
