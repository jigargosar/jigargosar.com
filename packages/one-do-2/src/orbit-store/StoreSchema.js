import {
  compose,
  defaultTo,
  keys,
  mapObjIndexed,
  merge,
  pluck,
  values,
} from '../lib/ramda'
import {mergeDefaults, validate} from '../lib/little-ramda'

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
    const attributeNames = pluck('name')(values(attributeLookup))

    const viewsLookup = compose(
      mapObjIndexed(ModelView),
      merge({[`${type} Grid`]: {}}),
      defaultTo([]),
    )(model.views)
    const viewNames = pluck('name')(values(viewsLookup))

    validate('A', [viewNames])
    validate('A', [attributeNames])

    return {
      type,
      attributeNames,
      getAttribute: name => attributeLookup[name],
      viewNames,
      getView: viewName => viewsLookup[viewName],
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
