import {nanoid} from '../lib/nanoid'
import {Schema} from './orbit'
import {validate} from '../lib/little-ramda'
import {recordType} from './little-orbit'
import {compose} from '../lib/ramda'

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

export const schema = new Schema({
  models: modelsDefinition,
  generateId,
})

export function getModel(type) {
  return schema.getModel(type)
}

export const attributeDesc = name => type =>
  getModel(type).attributes[name]

export const modelDescFromRec = record => {
  validate('O', [record])
  return compose(getModel, recordType)(record)
}

export const attributeDescFromRecord = name => record => {
  validate('SO', [name, record])

  return compose(attributeDesc(name), modelDescFromRec)(record)
}
