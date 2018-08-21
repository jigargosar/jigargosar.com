import {keys, map, values} from '../lib/ramda'

function SchemaModel(schema, model) {
  return {}
}

export function StoreSchema(store) {
  const schema = store.schema
  const modelLookup = map(model => SchemaModel(schema, model))(schema.models)
  return {
    models: values(modelLookup),
    getModel: type => modelLookup[type],
    modelTypes: keys(modelLookup),
  }
}
