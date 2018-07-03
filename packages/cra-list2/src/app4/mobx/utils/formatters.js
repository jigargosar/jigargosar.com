import * as mobx from 'mobx'

const listStyle = {
  style:
    'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal',
}
const mobxNameStyle = {style: 'color: rgb(232,98,0)'}
const nullStyle = {style: 'color: #777'}
const renderIterableHeader = (length, name = 'Iterable') => [
  'span',
  ['span', mobxNameStyle, name],
  ['span', `[${length}]`],
]

const reference = (object, config) => {
  if (typeof object === 'undefined') {
    return ['span', nullStyle, 'undefined']
  } else if (object === 'null') {
    return ['span', nullStyle, 'null']
  }
  return ['object', {object, config}]
}

const hasBody = (length, config) =>
  length > 0 && !(config && config.noPreview)

const simpleMapper = ([key, value]) => [
  'li',
  {},
  reference(key),
  ': ',
  reference(value),
]

const renderIterableBody = (collection, mapper = simpleMapper) => {
  const children = mobx.entries(collection).map(mapper)
  return ['ol', listStyle, ...children]
}

export const ObjectFormatter = {
  header(o) {
    if (!mobx.isObservableObject(o)) {
      return null
    }
    return renderIterableHeader(mobx.keys(o).length, 'Object')
  },
  hasBody: o => hasBody(mobx.keys(o).length),
  body: renderIterableBody,
}

export const MapFormatter = {
  header(o) {
    if (!mobx.isObservableMap(o)) {
      return null
    }
    return renderIterableHeader(o.size, 'Map')
  },
  hasBody: o => hasBody(o.size),
  body: renderIterableBody,
}

export const ArrayFormatter = {
  header(o) {
    if (!mobx.isObservableArray(o)) {
      return null
    }
    return renderIterableHeader(o, 'Array')
  },
  hasBody: o => hasBody(o.length),
  body: renderIterableBody,
}
