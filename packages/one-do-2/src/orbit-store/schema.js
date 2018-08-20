import {nanoid} from '../lib/nanoid'
import {Schema} from './orbit'
import {type} from '../lib/ramda'

const modelsDefinition = {
  task: {
    attributes: {
      title: {type: 'string'},
      isDone: {type: 'boolean'},
      createdAt: {type: 'timestamp'},
      sortIdx: {type: 'number'},
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
