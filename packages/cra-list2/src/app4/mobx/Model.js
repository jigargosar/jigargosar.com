import {
  createObservableObject,
  extendObservableObject,
  oObject,
} from './utils'
import {nanoid} from '../model/util'
import {upsert} from '../model/upsert'
import {_} from '../utils'

// function Model({
//   id = nanoid(),
//   createdAt = Date.now(),
//   modifiedAt = Date.now(),
//   typeName = 'Model',
// } = {}) {
//   const obs = createObservableObject({
//     props: {id, createdAt, modifiedAt},
//     actions: {},
//     name: `${typeName}@${id}`,
//   })
//   return obs
// }

export function Collection({name = 'Collection', docs = []} = {}) {
  const obs = createObservableObject({
    props: {
      docs,
      createObservableDoc({
        id = nanoid(),
        createdAt = Date.now(),
        modifiedAt = Date.now(),
        ...rest
      }) {
        return oObject({
          props: {id, createdAt, modifiedAt, ...rest},
          name: `${name} - Doc - ${id}`,
        })
      },
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
              return this.createObservableDoc(doc)
            },
            equals: _.eqProps('id'),
          },
          docsOrArray,
          this.docs,
        )
      },
    },
  })
  obs.upsert(docs)
  return obs
}
