import {nanoid} from '../lib/nanoid'
import {Schema} from './orbit'
import {mergeDefaults, overProp, validate} from '../lib/little-ramda'
import {typeOfRecord} from './little-orbit'
import {
  always,
  compose,
  cond,
  equals,
  isNil,
  map,
  pathEq,
} from '../lib/ramda'
import {randomBool, randomWord} from '../lib/fake'
import {assert} from '../lib/assert'

const modelsDefinition = {
  task: {
    views: {
      'Pending Tasks': {
        hideId: true,
        columns: ['isDone', 'title', 'dueAt'],
        filters: [pathEq(['attributes', 'isDone'], false)],
      },
      'All Tasks': {
        hideId: true,
        columns: ['isDone', 'title', 'dueAt'],
      },
      'Grid Without Id': {
        hideId: true,
      },
    },
    attributes: {
      sortIdx: {type: 'number', label: 'Sort Index'},
      isDone: {type: 'boolean', label: 'Done'},
      title: {type: 'string', label: 'Title'},
      dueAt: {type: 'timestamp', label: 'Due Date'},
      createdAt: {type: 'timestamp', label: 'Created'},
    },
  },
  planet: {
    attributes: {
      name: {type: 'string', label: 'Name'},
      classification: {type: 'string', label: 'Classification'},
    },
    relationships: {
      moons: {type: 'hasMany', model: 'moon', inverse: 'planet'},
    },
  },
  moon: {
    attributes: {
      name: {type: 'string', label: 'Name'},
    },
    relationships: {
      planet: {type: 'hasOne', model: 'planet', inverse: 'moons'},
    },
  },
}
function generateId(type) {
  return `${type}_${nanoid()}`
}

export function modelDescFromType(type) {
  validate('S', [type])

  const modelDesc = schema.models[type]
  validate('O', [modelDesc])

  return modelDesc
}

export const attributeDesc = name => type =>
  modelDescFromType(type).attributes[name]

export const modelDescFromRec = record => {
  validate('O', [record])
  return compose(modelDescFromType, typeOfRecord)(record)
}

export const attributeDescFromRecord = name => record => {
  validate('SO', [name, record])

  return compose(attributeDesc(name), typeOfRecord)(record)
}

function getDefaultValueForAttribute(a) {
  return cond([
    //
    [equals('number'), always(0)],
    [equals('string'), randomWord],
    [equals('boolean'), randomBool],
    [equals('timestamp'), Date.now],
  ])(a.type)
}

class CustomSchema extends Schema {
  initializeRecord(record) {
    super.initializeRecord(record)
    const type = record.type

    validate('S', [type])
    const model = this.getModel(type)
    assert(!isNil(model))

    const defaultAttributes = map(getDefaultValueForAttribute)(
      model.attributes,
    )
    const setDefaultProps = compose(
      overProp('attributes')(mergeDefaults(defaultAttributes)),
      mergeDefaults({attributes: {}}),
    )
    Object.assign(record, setDefaultProps(record))
  }
}

function createDefaultSchema() {
  return new CustomSchema({
    models: modelsDefinition,
    generateId,
  })
}

export const schema = createDefaultSchema()
