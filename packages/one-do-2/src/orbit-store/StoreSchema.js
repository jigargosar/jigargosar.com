import {keys, mapObjIndexed, values} from '../lib/ramda'

function SchemaModel(schema, model, type) {
  return {
    type,
    attributes: model.attributes,
  }
}

export function StoreSchema(store) {
  const schema = store.schema
  const modelLookup = mapObjIndexed((model, type) =>
    SchemaModel(schema, model, type),
  )(schema.models)
  return {
    models: values(modelLookup),
    getModel: type => modelLookup[type],
    modelTypes: keys(modelLookup),
  }
}
