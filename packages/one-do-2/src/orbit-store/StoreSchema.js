import {
  append,
  compose,
  defaultTo,
  find,
  keys,
  mapObjIndexed,
  merge,
  pluck,
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
    const attributeLookup = mapObjIndexed(ModelAttribute)(model.attributes)
    const attributes = values(attributeLookup)
    const views = compose(
      append(ModelView({}, `${type} Grid`)),
      values,
      mapObjIndexed(ModelView),
      defaultTo([]),
    )(model.views)

    const viewNames = pluck('name')(views)
    const attributeNames = pluck('name')(attributes)
    return {
      type,
      attributes,
      attributeNames,
      getAttribute: name => attributeLookup[name],
      views,
      viewNames,
      getView: viewName => find(propEq('name', viewName))(views),
    }

    function ModelAttribute(attribute, name) {
      return merge({name}, attribute)
    }

    function ModelView(view, name) {
      return mergeDefaults(
        {name, hideId: false, columns: attributeNames},
        view,
      )
    }
  }
}
