import {
  compose,
  defaultTo,
  keys,
  mapObjIndexed,
  merge,
  values,
} from '../lib/ramda'

export function StoreSchema(store) {
  const schema = store.schema
  const modelLookup = mapObjIndexed(SchemaModel)(schema.models)
  return {
    models: values(modelLookup),
    getModel: type => modelLookup[type],
    modelTypes: keys(modelLookup),
  }

  function SchemaModel(model, type) {
    console.log(`model`, model)
    const attributeLookup = mapObjIndexed(ModelAttribute)(model.attributes)

    return {
      type,
      attributes: values(attributeLookup),
      views: compose(values, mapObjIndexed(ModelView), defaultTo([]))(
        model.views,
      ),
    }

    function ModelAttribute(attribute, name) {
      return merge({name}, attribute)
    }

    function ModelView(view, name) {
      return merge({name}, view)
    }
  }
}
