import {keys, mapObjIndexed, values, pick, merge} from '../lib/ramda'

export function StoreSchema(store) {
  const schema = store.schema
  const modelLookup = mapObjIndexed(SchemaModel)(schema.models)
  return {
    models: values(modelLookup),
    getModel: type => modelLookup[type],
    modelTypes: keys(modelLookup),
  }

  function SchemaModel(model, type) {
    function ModelAttribute(attribute, name) {
      return merge({name}, attribute)
    }

    const attributeLookup = mapObjIndexed(ModelAttribute)(model.attributes)
    return {
      type,
      attributes: values(attributeLookup),
    }
  }
}
