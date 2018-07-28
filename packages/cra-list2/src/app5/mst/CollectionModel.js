import {getParent, hasParent, types} from 'mobx-state-tree'
import {invoke0, R, tapEach} from '../little-ramda'
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
  return modelNamed(`${name}Model`)
    .props(attrProps)
    .views(self => ({
      get collection() {
        a(hasParent(self, 2))
        const c = getParent(self, 2)
        a(R.has('delete')(c))
        return c
      },
      get children() {
        return []
      },
    }))
    .actions(self => ({
      updateAttrs(attrs) {
        Object.assign(self, attrs)
      },
      deleteTree() {
        tapEach(invoke0('deleteTree'))(self.children)
        self.collection.delete(self)
      },
    }))
}

export function getIDTypeOfModel(Model) {
  return Model.properties.id.type
}
