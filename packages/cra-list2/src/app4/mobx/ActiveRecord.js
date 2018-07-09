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
        return loadAll()
      },
    },
    name: collectionName,
  })

  function loadAll() {
    return _.map(fromJSON, storage.get(collectionName) || [])
  }

  function createNew(defaultValues = {}) {
    return fromJSON({
      id: `${name}@${nanoid()}`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      isNew: true,
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

  function fromJSON(json) {
    return createObservableObject({
      props: {
        ...json,
        isNew: _.defaultTo(false, json.isNew),
        toJSON() {
          return _.pickAll(
            ['id', 'createdAt', 'modifiedAt', ...fieldNames],
            this,
          )
        },
      },
      actions: {
        save() {},
      },
      name: json.id,
    })
  }

  return activeRecord
}
