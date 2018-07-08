import {createObservableObject} from './utils'
import {nanoid} from '../model/util'
import {_} from '../utils'

function Model(defaults) {
  const obs = createObservableObject({
    props: {},
    actions: {
      setDefaults(defaults) {
        Object.assign(
          this,
          _.mergeDeepRight(
            {
              id: nanoid(),
              createdAt: Date.now(),
              modifiedAt: Date.now(),
            },
            defaults,
          ),
        )
      },
    },
    name: 'Model',
  })
  obs.setDefaults(defaults)
  return obs
}

export function Collection({docs = []} = {}) {
  const obs = createObservableObject({
    props: {docs},
    actions: {
      setDefaults() {},
    },
    name: 'Collection',
  })
  obs.setDefaults()
  return obs
}
