import {nanoid} from '../lib/nanoid'
import {Schema} from './orbit'
import {mergeDefaults, overProp, validate} from '../lib/little-ramda'
import {typeOfRecord} from './little-orbit'
import {always, compose, cond, equals, isNil, map} from '../lib/ramda'
import {fWord} from '../lib/fake'
import {assert} from '../lib/assert'

const modelsDefinition = {
  task: {
    views: {
      'Grid Without Id': {
        hideId: true,
      },
    },
    attributes: {
      title: {type: 'string', label: 'Title'},
      isDone: {type: 'boolean', label: 'Done'},
      sortIdx: {type: 'number', label: 'Sort Index'},
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
    [equals('string'), fWord],
    [equals('boolean'), always(false)],
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

    const defaultAttributed = map(getDefaultValueForAttribute)(
      model.attributes,
    )
    const setDefaultProps = compose(
      overProp('attributes')(mergeDefaults(defaultAttributed)),
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
