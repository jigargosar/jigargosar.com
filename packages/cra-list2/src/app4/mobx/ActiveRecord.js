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
        return _.map(fromJSON, storage.get(collectionName) || [])
      },
    },
    name: collectionName,
  })

  function createNew(defaultValues = {}) {
    return fromJSON({
      id: `${name}@${nanoid()}`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      ...createProps(),
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

  function fromJSON(snapshot) {
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
      name: snapshot.id,
    })
  }

  return activeRecord
}
