import {types} from 'mobx-state-tree'
import {R} from '../little-ramda'
import nanoid from 'nanoid'

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

export function Model({name, attrs = {}}) {
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
  return types.model(name, attrProps)
}

export function getIDTypeOfModel(modelType) {
  return modelType.properties.id.type
}
