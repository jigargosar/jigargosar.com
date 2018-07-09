import {createObservableObject} from './utils'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'
import {storage} from '../services/storage'

export function ActiveRecord({fieldNames, name}) {
  validate('AS', [fieldNames, name])
  const collectionName = `${name}Collection`
  const activeRecord = createObservableObject({
    props: {
      fieldNames,
      name,
    },
    actions: {
      new: createNew,
      findAll() {
        _.map(parseRecord, storage.get(collectionName) || [])
        return []
      },
    },
    name: collectionName,
  })

  function createNew(defaultValues = {}) {
    const id = nanoid()
    const props = createProps()

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

    function createProps() {
      const props = _.compose(
        _.mergeAll,
        _.map(propName => ({
          [propName]: _.defaultTo(null, defaultValues[propName]),
        })),
      )(fieldNames)
      validate('O', [props])
      return props
    }
  }

  function parseRecord({fieldNames, snapshot, name}) {
    return createObservableObject({
      props: {
        ...snapshot,
        toJSON() {
          return _.pickAll(
            ['id', 'createdAt', 'modifiedAt', ...fieldNames],
            this,
          )
        },
      },
      actions: {},
      name: `${name}@${snapshot.id}`,
    })
  }

  return activeRecord
}
