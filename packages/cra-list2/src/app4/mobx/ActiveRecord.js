import {createObservableObject, mAutoRun, oArray} from './little-mobx'
import {nanoid} from '../model/util'
import {_, validate} from '../little-ramda'
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
      records: oArray([], {deep: false}),
      get allFieldNames() {
        return _.concat(fieldNames, ['id', 'createdAt', 'modifiedAt'])
      },
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
      get snapshot() {
        return _.map(r => r.snapshot, this.records)
      },
    },
    actions: {
      saveRecord(record) {
        // adapter.upsert(record.snapshot)
        if (record.isNew) {
          this.records.push(record)
          record.isNew = false
        }
        return record
      },
      upsert({id, ...values} = {}) {
        const record = this.findById(id)
        if (record) {
          const updates = _.compose(
            _.partial(removeDuplicateUpdates, [record]),
            removeInvalidUpdateKeys,
          )(values)

          Object.assign(record, updates)
          if (hasPersistenceFields(updates)) {
            record.modifiedAt = Date.now()
            return this.saveRecord(record)
          } else {
            return record
          }
        } else {
          return this.saveRecord(createNew(values))
        }
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
  )(options)

  activeRecord.load()

  mAutoRun(
    () => {
      adapter.saveAll(activeRecord.snapshot)
    },
    {name: 'save ActiveRecord'},
  )

  return activeRecord

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
      _.reject(_.eqProps(_.__, record, updates)),
      _.keys,
    )(updates)
  }

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
    const obs = createObservableObject({
      props: {
        ...json,
        isNew: _.defaultTo(false, json.isNew),
      },
      computed: {
        get snapshot() {
          return _.pick(
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
    return obs
  }
}

function LocalStorageAdapter({name}) {
  function loadAll() {
    return storage.get(name) || []
  }

  function saveAll(list) {
    validate('A', [list])
    storage.set(name, list)
  }
  function upsert(record) {
    validate('S', [record.id])
    debugger
    const updatedList = (() => {
      const all = loadAll()
      const idx = _.findIndex(_.eqProps('id', record), all)
      const update = idx > -1 ? _.update(idx) : _.append
      return update(record, all)
    })()

    saveAll(updatedList)
  }
  return {loadAll, upsert, saveAll}
}
