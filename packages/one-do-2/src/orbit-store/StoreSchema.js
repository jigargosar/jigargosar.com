import {
  compose,
  defaultTo,
  keys,
  mapObjIndexed,
  merge,
  pluck,
  prepend,
  values,
} from '../lib/ramda'
import {mergeDefaults} from '../lib/little-ramda'

export function StoreSchema(store) {
  const schema = store.schema
  const modelLookup = mapObjIndexed(SchemaModel)(schema.models)
  return {
    models: values(modelLookup),
    getModel: type => modelLookup[type],
    modelTypes: keys(modelLookup),
  }

  function SchemaModel(model, type) {
    const attributes = compose(values, mapObjIndexed(ModelAttribute))(
      model.attributes,
    )
    return {
      type,
      attributes,
      views: compose(
        prepend(ModelView({}, 'default')),
        values,
        mapObjIndexed(ModelView),
        defaultTo([]),
      )(model.views),
    }

    function ModelAttribute(attribute, name) {
      return merge({name}, attribute)
    }

    function ModelView(view, name) {
      return mergeDefaults(
        {name, showId: true, columns: pluck('name')(attributes)},
        view,
      )
    }
  }
}
