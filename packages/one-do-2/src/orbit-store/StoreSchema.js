import {
  compose,
  defaultTo,
  has,
  head,
  isEmpty,
  keys,
  lensIndex,
  map,
  mapObjIndexed,
  merge,
  over,
  pluck,
  propOr,
  replace,
  tail,
  toUpper,
  unless,
  values,
} from '../lib/ramda'
import {mergeDefaults, overProp, validate} from '../lib/little-ramda'
import {assert} from '../lib/assert'

function fstToUpper(str) {
  if (isEmpty(str)) return str
  const [first, rest] = [head(str), tail(str)]
  return toUpper(first) + rest
}

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
      merge({[`Default ${fstToUpper(type)} Grid`]: {}}),
      defaultTo([]),
    )(model.views)
    assert(!isEmpty(viewsLookup))
    const viewNames = pluck('name')(values(viewsLookup))
    const defaultViewName = propOr(head(viewNames), 1)(viewNames)

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
          type: 'grid',
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
