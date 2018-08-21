import {keys, mapObjIndexed, values} from '../lib/ramda'

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
      return {name, type: attribute.type}
    }

    const attributeLookup = mapObjIndexed(ModelAttribute)(model.attributes)
    return {
      type,
      attributes: values(attributeLookup),
    }
  }
}
