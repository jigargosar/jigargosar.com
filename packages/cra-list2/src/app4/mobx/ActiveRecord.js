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

  return activeRecord

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
        save() {
          upsert(this)
          this.isNew = false
        },
      },
      name: json.id,
    })
  }
  function upsert(record) {
    const updated = (() => {
      const all = loadAll()
      if (record.isNew) {
        return _.append(record, all)
      } else {
        const updater = _.when(
          _.propEq('id', this.id),
          _.always(this),
        )
        return _.map(updater, all)
      }
    })()

    saveAll(updated)

    function saveAll(all) {
      return storage.set(_.map(r => r.toJSON(), all), collectionName)
    }
  }

  function loadAll() {
    return _.map(fromJSON, storage.get(collectionName) || [])
  }
}

function LocalStorageAdapter({name: collectionName}) {
  function upsert(record) {
    const updated = (() => {
      const all = loadAll()
      if (record.isNew) {
        return _.append(record, all)
      } else {
        const updater = _.when(
          _.propEq('id', this.id),
          _.always(this),
        )
        return _.map(updater, all)
      }
    })()
    storage.set(updated, collectionName)
  }

  function loadAll() {
    return storage.get(collectionName) || []
  }
  return {loadAll, upsert}
}
