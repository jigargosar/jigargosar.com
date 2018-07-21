import {types} from 'mobx-state-tree'

export function Collection({model}) {
  return types.model(`${model.name}Collection`, {
    lookup: model,
  })
}
