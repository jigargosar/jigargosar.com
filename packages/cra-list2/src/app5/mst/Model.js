import {types} from 'mobx-state-tree'
import {modelId, nanoid} from '../little-model'
import {R} from '../little-ramda'

export function Model({name, attrs}) {
  return types.model(name, {
    attrs: types.model(
      'Attr',
      R.merge(attrs, {
        id: types.optional(types.identifier, () => modelId(name)),
        name: '',
      }),
    ),
  })
}
