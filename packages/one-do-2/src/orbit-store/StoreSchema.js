import {
  compose,
  defaultTo,
  has,
  head,
  isEmpty,
  keys,
  map,
  mapObjIndexed,
  merge,
  pluck,
  values,
} from '../lib/ramda'
import {mergeDefaults, validate} from '../lib/little-ramda'
import {assert} from '../lib/assert'

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
    assert(!isEmpty(viewsLookup))
    const viewNames = pluck('name')(values(viewsLookup))
    const defaultViewName = head(viewNames)

    validate('A', [viewNames])
    validate('A', [attributeNames])

    return {
      type,
      attributeNames,
      getAttribute,
      viewNames,
      getView,
      defaultView: getView(defaultViewName),
    }

    function getAttribute(name) {
      return attributeLookup[name]
    }

    function getView(viewName) {
      validate('S', [viewName])
      assert(has(viewName, viewsLookup))
      return viewsLookup[viewName]
    }

    function ModelAttribute(attribute, name) {
      return merge({name}, attribute)
    }

    function ModelView(view, name) {
      const viewProps = mergeDefaults(
        {
          name,
          hideId: false,
          columns: attributeNames,
        },
        view,
      )
      return {
        ...viewProps,
        columnAttributes: map(getAttribute)(viewProps.columns),
      }
    }
  }
}
