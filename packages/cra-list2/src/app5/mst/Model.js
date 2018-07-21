import {types} from 'mobx-state-tree'
import {modelId} from '../little-model'
import {R} from '../little-ramda'

export function Model({name, attrs = {}}) {
  const attrProps = R.merge(
    {
      id: types.optional(types.identifier, () => modelId(name)),
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
