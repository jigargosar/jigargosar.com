import {map} from '../lib/ramda'

function SchemaModel(schema, model) {
  return {}
}

export function StoreSchema(store) {
  const schema = store.schema
  const models = map(model => SchemaModel(schema, model))(schema.models)
  return {
    models: models,
    getModel: type => models[type],
  }
}
