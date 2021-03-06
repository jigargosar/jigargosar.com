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
  isEmpty,
  keys,
  mapObjIndexed,
  merge,
  pathOr,
  pluck,
  propOr,
  take,
  values,
} from 'ramda'
import {attributePath} from './little-orbit'
import {
  ascend,
  descend,
  isNil,
  partial,
  T,
  without,
} from '../lib/exports-ramda'

export function StoreSchema(store) {
  const schema = store.schema
  const modelLookup = mapObjIndexed(SchemaModel)(schema.models)
  return {
    models: values(modelLookup),
    getModel: type => modelLookup[type],
    modelTypes: keys(modelLookup),
  }
}

function SchemaModel(model, type) {
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
    merge(mapObjIndexed(attributeToComputed)(model.attributes)),
    defaultTo({}),
  )(model.computed)

  const viewsLookup = compose(
    mapObjIndexed(partial(ModelView, [computedLookup])),
    merge({[`Default ${fstToUpper(type)} Grid`]: {}}),
    defaultTo([]),
  )(model.views)

  assert(!isEmpty(viewsLookup))
  const viewNames = pluck('name')(values(viewsLookup))
  return {
    type,
    viewNames,
    getView,
    defaultView: getView(propOr(head(viewNames), 1)(viewNames)),
  }

  function getView(viewName) {
    validate('S', [viewName])
    assert(has(viewName, viewsLookup))
    return viewsLookup[viewName]
  }
}

function ModelView(computedLookup, view, name) {
  const viewProps = mergeDefaults(
    {
      name,
      columnNames: without(['id'])(keys(computedLookup)),
      filters: [],
      defaultSort: null,
    },
    view,
  )

  return {
    ...viewProps,
    filterRecords: filter(allPass(viewProps.filters)),
    getComputed,
    getComputedData,
    getSortComparatorForOrDefault: (customSort = []) => {
      if (isNil(customSort[0])) return getDefaultSortComparator()
      const [computedName, direction] = customSort
      const directionFn = direction === 'asc' ? ascend : descend

      return directionFn(record => getComputedData(computedName, record))
    },
  }

  function getDefaultSortComparator() {
    const defaultSort = viewProps.defaultSort
    if (isNil(defaultSort)) return T
    const [computedName, direction = 'asc'] = defaultSort
    const directionFn = direction === 'asc' ? ascend : descend

    return directionFn(record => getComputedData(computedName, record))
  }

  function getComputedData(name, record) {
    validate('SO', [name, record])
    return getComputed(name).get(record)
  }

  function getComputed(name) {
    validate('S', [name])
    const computed = computedLookup[name]
    assert(computed)
    return computed
  }
}

function attributeToComputed(attribute, attributeName) {
  const name = attributeName
  return {
    get: pathOr(null, attributePath(name)),
    label: attribute.label || name,
    type: attribute.type || 'string',
  }
}
