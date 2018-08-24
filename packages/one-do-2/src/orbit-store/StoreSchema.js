import {fstToUpper, mergeDefaults} from '../lib/little-ramda'
import {assert} from '../lib/assert'
import {validate} from '../lib/validate'
import {
  __,
  allPass,
  compose,
  contains,
  defaultTo,
  filter,
  has,
  head,
  identity,
  isEmpty,
  keys,
  mapObjIndexed,
  merge,
  pluck,
  propOr,
  values,
} from 'ramda'

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
    const attributeList = values(attributeLookup)
    const attributeNames = pluck('name')(attributeList)

    const relationshipLookup = defaultTo({})(model.relationships)
    // const relationshipNames = keys(relationshipLookup)

    const computedLookup = defaultTo({})(model.computed)
    const computedNames = keys(computedLookup)

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
      relationships: relationshipLookup,
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
          columnNames: [...computedNames, ...attributeNames],
          type: 'grid',
          filters: [],
          groupBy: null,
          groupKeyToTitle: identity,
        },
        view,
      )

      return {
        ...viewProps,
        filterRecords: filter(allPass(viewProps.filters)),
        getAttribute,
        hasAttribute: contains(__, attributeNames),
        relationships: relationshipLookup,
        relationshipLookup,
        computedLookup,
      }
    }
  }
}
