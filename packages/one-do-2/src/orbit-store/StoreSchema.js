import {fstToUpper, mergeDefaults} from '../lib/little-ramda'
import {assert} from '../lib/assert'
import {validate} from '../lib/validate'
import {
  allPass,
  compose,
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
  pluck,
  propOr,
  values,
} from 'ramda'

function idColumn() {
  return {type: 'id'}
}

function attributeColumn(data) {
  return {type: 'attribute', data}
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
    const attributeList = values(attributeLookup)
    const attributeNames = pluck('name')(attributeList)

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
      relationships: defaultTo({})(model.relationships),
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
          columns: [
            idColumn(),
            ...map(name => ({name, type: 'attribute'}))(attributeNames),
          ],
          type: 'grid',
          filters: [],
          groupBy: null,
          groupKeyToTitle: identity,
        },
        view,
      )

      function toColConfig(column) {
        if (column.type === 'id') {
          return idColumn()
        } else {
          return attributeColumn(getAttribute(column.name))
        }
      }

      return {
        ...viewProps,
        columns: map(toColConfig)(viewProps.columns),
        filterRecords: filter(allPass(viewProps.filters)),
      }
    }
  }
}
