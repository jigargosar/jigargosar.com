import {createObservableObject} from './utils'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'
import {storage} from '../services/storage'

export function ActiveRecord({fieldNames, name}) {
  validate('AS', [fieldNames, name])
  const collectionName = `${name}Collection`
  const adapter = LocalStorageAdapter({name: collectionName})

  const activeRecord = createObservableObject({
    props: {
      fieldNames,
      name,
    },
    actions: {
      createAndSave(values) {
        this.new(values).save()
      },
      new: createNew,
      findAll() {
        return _.map(fromJSON, adapter.loadAll())
      },
    },
    name: collectionName,
  })

  return activeRecord

  function createNew(values = {}) {
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
          [propName]: _.defaultTo(null, values[propName]),
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
          adapter.upsert(this.toJSON())
          this.isNew = false
        },
      },
      name: json.id,
    })
  }
}

function LocalStorageAdapter({name}) {
  function upsert(record) {
    validate('S', [record.id])

    const updatedList = (() => {
      const all = loadAll()
      const idx = _.findIndex(_.eqProps('id', record), all)
      const update = idx > -1 ? _.update(idx) : _.append
      return update(record, all)
    })()
    storage.set(name, updatedList)
  }

  function loadAll() {
    return storage.get(name) || []
  }
  return {loadAll, upsert}
}
