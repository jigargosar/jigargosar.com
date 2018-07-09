import {createObservableObject} from './little-mobx'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'
import {storage} from '../services/storage'

export function ActiveRecord({fieldNames, name, queries = {}}) {
  validate('AS', [fieldNames, name])
  const collectionName = `${name}Collection`
  const adapter = LocalStorageAdapter({name: collectionName})

  const aro = {
    props: {
      fieldNames,
      name,
      records: [],
      saveRecord(record) {
        adapter.upsert(record.toJSON())
        if (record.isNew) {
          this.records.push(record)
          record.isNew = false
        }
      },
    },
    actions: {
      createAndSave(values) {
        this.saveRecord(this.new(values))
      },
      new: createNew,
      findAll({filter = _.identity, sortComparators = []} = {}) {
        return _.compose(
          _.sortWith(sortComparators),
          _.filter(filter),
        )(this.records)
      },
      load() {
        this.records = _.map(fromJSON, adapter.loadAll())
      },
    },
    name: collectionName,
  }
  const activeRecord = _.compose(
    observableObject =>
      createObservableObject({
        observableObject,
        computed: createQueries(observableObject),
      }),
    createObservableObject,
  )(aro)

  activeRecord.load()
  return activeRecord

  function createQueries(activeRecord) {
    return _.reduce(
      (obj, [key, options]) =>
        Object.defineProperty(obj, key, {
          get() {
            return activeRecord.findAll(options)
          },
          enumerable: true,
        }),
      {},
      _.toPairs(queries),
    )
  }

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
        update(values) {
          const keys = _.filter(
            _.contains(_.__, fieldNames),
            _.keys(values),
          )
          const pickKeys = _.pick(keys)
          const updates = pickKeys(values)
          if (_.equals(updates, pickKeys(this))) {
            return
          }
          Object.assign(this, updates)
          this.modifiedAt = Date.now()
          activeRecord.saveRecord(this)
        },
        setDeleted(deleted = true) {
          this.update({deleted})
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
