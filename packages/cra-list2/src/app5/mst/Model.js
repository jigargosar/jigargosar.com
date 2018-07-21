import {types} from 'mobx-state-tree'

export function Model({name, attrs}) {
  return types.model(name, {attrs: types.model('Attr', attrs)})
}
