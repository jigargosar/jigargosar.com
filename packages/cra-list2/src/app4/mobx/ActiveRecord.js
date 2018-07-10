import {createObservableObject} from './little-mobx'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'
import {storage} from '../services/storage'

export function ActiveRecord({
  fieldNames,
  volatileFieldNames = [],
  name,
  queries = {},
}) {
  validate('AAS', [fieldNames, volatileFieldNames, name])
  const collectionName = `${name}Collection`
  const adapter = LocalStorageAdapter({name: collectionName})

  const options = {
    props: {
      fieldNames,
      name,
      records: [],
      findAll({filter = _.identity, sortComparators = []} = {}) {
        return _.compose(
          _.sortWith(sortComparators),
          _.filter(filter),
        )(this.records)
      },

      find({filter = _.identity} = {}) {
        return _.head(this.findAll({filter}))
      },
      findById(id) {
        validate('S|Z', [id])
        if (_.isNil(id)) {
          return null
        }
        return this.find({filter: _.propEq('id', id)})
      },
    },
    actions: {
      saveRecord(record) {
        adapter.upsert(record.toJSON())
        if (record.isNew) {
          this.records.push(record)
          record.isNew = false
        }
      },
      upsert(options) {
        const values = _.omit(['id'], options)
        const record = this.findById(values.id)

        if (record) {
          const updates = _.compose(
            _.partial(removeDuplicateUpdates, [record]),
            removeInvalidUpdateKeys,
          )(values)

          Object.assign(record, updates)
          if (hasPersistenceFields(updates)) {
            record.modifiedAt = Date.now()
            this.saveRecord(record)
          }
        } else {
          this.saveRecord(createNew(values))
        }
      },
      upsert__(values) {
        const record = this.findById(values.id)

        if (record) {
          const pickKeys = _.pick(
            _.filter(
              _.contains(_.__, _.concat(fieldNames)),
              _.keys(values),
            ),
          )
          const updates = pickKeys(values)

          if (_.equals(updates, pickKeys(record))) {
            return
          }
          Object.assign(record, updates)
          record.modifiedAt = Date.now()
          this.saveRecord(record)
        } else {
          this.saveRecord(createNew(values))
        }
      },
      load() {
        this.records = _.map(fromJSON, adapter.loadAll())
      },
    },
    name: collectionName,
  }

  function hasPersistenceFields(updates) {
    const nonVolatileFieldNames = _.difference(
      _.keys(updates),
      volatileFieldNames,
    )
    return _.any(_.contains(_.__, fieldNames))(nonVolatileFieldNames)
  }

  function removeInvalidUpdateKeys(values) {
    const validValues = _.pick(fieldNames, values)
    console.assert(
      _.equals(values, validValues),
      `Invalid values=`,
      _.omit(fieldNames, values),
      'values=',
      values,
    )
    return validValues
  }

  function removeDuplicateUpdates(record, updates) {
    return _.compose(
      _.pick(_.__, updates),
      _.filter(_.eqProps(_.__, record, updates)),
      _.keys,
    )(updates)
  }

  const activeRecord = _.compose(
    observableObject =>
      createObservableObject({
        observableObject,
        computed: createQueries(observableObject),
      }),
    createObservableObject,
  )(options)

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

  function createNew(defaults = {}) {
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
          [propName]: _.defaultTo(null, defaults[propName]),
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
        setDeleted(deleted = true) {
          this.update({id: this.id, deleted})
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
