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
  map,
  mapObjIndexed,
  merge,
  pathOr,
  pluck,
  propOr,
  take,
  values,
} from 'ramda'
import {attributePath} from './little-orbit'
import {omit} from '../lib/exports-ramda'

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

    const computedLookup = compose(
      merge({
        id: {
          label: 'id',
          get: row => row.id,
        },
        shortId: {
          label: 'ID',
          get: row => take(10)(row.id),
        },
      }),
      merge(map(attributeToComputed)(attributeLookup)),
      defaultTo({}),
    )(model.computed)

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

    function attributeToComputed(attribute) {
      return {
        get: pathOr(null, attributePath(attribute.name)),
        label: attribute.label || attribute.name,
        type: attribute.type || 'string',
      }
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
          columnNames: omit(['id'])(computedNames),
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
        getComputedData: (name, record) => {
          validate('SO', [name, record])
          return getComputed(name).get(record)
        },
      }

      function getComputed(name) {
        validate('S', [name])
        const computed = computedLookup[name]
        assert(computed)
        return computed
      }
    }
  }
}
