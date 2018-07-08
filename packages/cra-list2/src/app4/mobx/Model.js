import {
  createObservableObject,
  extendObservableObject,
  oObject,
} from './utils'
import {nanoid} from '../model/util'
import {upsert} from '../model/upsert'
import {_} from '../utils'

function createCollectionDoc(
  {
    id = nanoid(),
    createdAt = Date.now(),
    modifiedAt = Date.now(),
    ...rest
  },
  collection,
) {
  return oObject({
    props: {
      id,
      createdAt,
      modifiedAt,
      ...rest,
      collection,
    },
    name: `${collection.name} - Doc - ${id}`,
  })
}

export function Collection({name = 'Collection'} = {}) {
  const obs = createObservableObject({
    props: {
      docs: [],
    },
    actions: {
      upsert(docsOrArray) {
        this.docs = upsert(
          {
            mapBeforeUpsert: (doc, oldDoc) => {
              if (oldDoc) {
                Object.assign(oldDoc, doc)
                return oldDoc
              }
              return createCollectionDoc(doc, this)
            },
            equals: _.eqProps('id'),
          },
          docsOrArray,
          this.docs,
        )
      },
    },
  })

  return obs
}
