import {createObservableObject, extendObservableObject} from './utils'
import {nanoid} from '../model/util'

function Model({
  id = nanoid(),
  createdAt = Date.now(),
  modifiedAt = Date.now(),
  name = 'Model',
} = {}) {
  const obs = createObservableObject({
    props: {id, createdAt, modifiedAt},
    actions: {},
    name: `${name}@${id}`,
  })
  return obs
}

export function Collection({
  name = 'Collection',
  docs = [],
  ...rest
} = {}) {
  const obs = extendObservableObject(Model({name, ...rest}), {
    props: {docs},
    actions: {
      setDefaults() {},
    },
  })
  obs.setDefaults()
  return obs
}
