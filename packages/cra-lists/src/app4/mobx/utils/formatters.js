import * as mobx from 'mobx'

const listStyle = {
  style:
    'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal',
}
const mobxNameStyle = {style: 'color: rgb(232,98,0)'}
const nullStyle = {style: 'color: #777'}
const renderIterableHeader = (iterable, name = 'Iterable') => [
  'span',
  ['span', mobxNameStyle, name],
  ['span', `[${iterable.length}]`],
]

const reference = (object, config) => {
  if (typeof object === 'undefined') {
    return ['span', nullStyle, 'undefined']
  } else if (object === 'null') {
    return ['span', nullStyle, 'null']
  }
  return ['object', {object, config}]
}

const hasBody = (collection, config) =>
  collection.length > 0 && !(config && config.noPreview)

const renderIterableBody = (collection, mapper, options = {}) => {
  const children = Object.entries(mobx.toJS(collection)).map(mapper)
  return ['ol', listStyle, ...children]
}

export const ObjectFormatter = {
  header(o) {
    if (!mobx.isObservableObject(o)) {
      return null
    }
    return renderIterableHeader(Object.keys(o), 'Object')
  },
  hasBody: o => hasBody(Object.keys(o)),
  body(o) {
    return renderIterableBody(o, ([key, value]) => [
      'li',
      {},
      reference(key),
      ': ',
      reference(value),
    ])
  },
}
