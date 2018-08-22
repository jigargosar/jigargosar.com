import {
  compose,
  defaultTo,
  find,
  keys,
  mapObjIndexed,
  merge,
  pluck,
  prepend,
  propEq,
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
    const views = compose(
      prepend(ModelView({}, 'Default Grid')),
      values,
      mapObjIndexed(ModelView),
      defaultTo([]),
    )(model.views)
    return {
      type,
      attributes,
      views,
      getView: viewName => find(propEq('name', viewName))(views),
    }

    function ModelAttribute(attribute, name) {
      return merge({name}, attribute)
    }

    function ModelView(view, name) {
      return mergeDefaults(
        {name, hideId: false, columns: pluck('name')(attributes)},
        view,
      )
    }
  }
}
