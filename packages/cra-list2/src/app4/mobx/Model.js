import {createObservableObject, extendObservableObject} from './utils'
import {nanoid} from '../model/util'
import {upsert} from '../model/upsert'
import {_} from '../utils'

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
      replaceAllWithSnapshotDocs(snapshotDocs) {
        this.docs = upsert(
          {
            mapBeforeUpsert: item => Model(item),
            equals: _.eqProps('id'),
          },
          snapshotDocs,
          this.docs,
        )
      },
    },
  })
  obs.replaceAllWithSnapshotDocs(docs)
  return obs
}
