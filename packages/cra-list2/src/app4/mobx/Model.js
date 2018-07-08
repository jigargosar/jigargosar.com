import {createObservableObject, extendObservableObject} from './utils'
import {nanoid} from '../model/util'
import {upsert} from '../model/upsert'
import {_} from '../utils'

function Model({
  id = nanoid(),
  createdAt = Date.now(),
  modifiedAt = Date.now(),
  typeName = 'Model',
} = {}) {
  const obs = createObservableObject({
    props: {id, createdAt, modifiedAt},
    actions: {},
    name: `${typeName}@${id}`,
  })
  return obs
}

export function Collection({
  typeName = 'Collection',
  docs = [],
  types = [],
  ...rest
} = {}) {
  const obs = extendObservableObject(Model({typeName, ...rest}), {
    props: {docs},
    actions: {
      replaceAllWithSnapshotDocs(snapshotDocs) {
        this.docs = upsert(
          {
            mapBeforeUpsert: Model,
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
