import {nanoid} from '../lib/nanoid'
import {Schema} from './orbit'
import {overProp, validate} from '../lib/little-ramda'
import {typeOfRecord} from './little-orbit'
import {compose, defaultTo, mergeWith} from '../lib/ramda'
import {fWord} from '../lib/fake'

const modelsDefinition = {
  task: {
    attributes: {
      title: {type: 'string'},
      isDone: {type: 'boolean'},
      sortIdx: {type: 'number'},
      createdAt: {type: 'timestamp'},
    },
  },
  planet: {
    attributes: {
      name: {type: 'string'},
      classification: {type: 'string'},
    },
    relationships: {
      moons: {type: 'hasMany', model: 'moon', inverse: 'planet'},
    },
  },
  moon: {
    attributes: {
      name: {type: 'string'},
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

class CustomSchema extends Schema {
  initializeRecord(record) {
    super.initializeRecord(record)
    if (record.type === 'task') {
      const setDefaultProps = compose(
        overProp('attributes')(
          mergeWith(defaultTo)({
            title: fWord(),
            createdAt: Date.now(),
            isDone: false,
            sortIdx: 0,
          }),
        ),
        mergeWith(defaultTo)({attributes: {}}),
      )
      Object.assign(record, setDefaultProps(record))
    }
  }
}

function createDefaultSchema() {
  return new CustomSchema({
    models: modelsDefinition,
    generateId,
  })
}

export const schema = createDefaultSchema()
