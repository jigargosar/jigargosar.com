import {getParent, hasParent, types} from 'mobx-state-tree'
import {R} from '../little-ramda'
import nanoid from 'nanoid'
import {modelNamed} from '../little-mst'

const a = require('nanoassert')

function idPrefixFromModelName(name) {
  return `${name}_`
}

function newModelId(name) {
  return `${idPrefixFromModelName(name)}${nanoid()}`
}

function createModelIDType(name) {
  return types.refinement(
    `${name}ID`,
    types.identifier,
    R.startsWith(idPrefixFromModelName(name)),
  )
}

export function CollectionModel({name, attrs = {}}) {
  const attrProps = R.merge(
    {
      id: types.optional(createModelIDType(name), () =>
        newModelId(name),
      ),
      name: '',
      deleted: false,
    },
    attrs,
  )
  // const props = {
  //   attrs: types.model(`${name}Attrs`, attrProps),
  // }
  return modelNamed(name)
    .props(attrProps)
    .views(self => ({
      get collection() {
        a(hasParent(self, 2))
        const c = getParent(self, 2)
        a(R.has('delete')(c))
        return c
      },
    }))
}

export function getIDTypeOfModel(modelType) {
  return modelType.properties.id.type
}
