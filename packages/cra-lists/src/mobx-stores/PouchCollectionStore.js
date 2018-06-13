import nanoid from 'nanoid'
import {PouchService} from './pouch-service'
import {SF} from '../safe-fun'

const R = require('ramda')
const idPropName = '_id'

export async function PouchCollectionStore(collectionName) {
  const pouchStore = PouchService.create(
    `${collectionName}Collection`,
  )
  const docs = await pouchStore.getAll()
  const idLookup = R.compose(
    R.fromPairs,
    R.map(doc => [SF.prop(idPropName), doc]),
  )(docs)
  return {
    list() {
      return R.compose(Array.from, R.values(idLookup))
    },
    upsert(doc) {
      const id = R.propOr(idPropName, nanoid())(doc)
      return pouchStore.put(R.merge(doc, {[idPropName]: id}))
    },
  }
}
