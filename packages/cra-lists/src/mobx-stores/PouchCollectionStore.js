import nanoid from 'nanoid'
import {PouchService} from './pouch-service'
import {SF} from '../safe-fun'
import {observable, action} from 'mobx'

const R = require('ramda')
const idPropName = '_id'

export async function PouchCollectionStore(modelName) {
  const storeName = `${modelName}Collection`
  const pouchStore = PouchService.create(storeName)
  const docs = await pouchStore.getAll()
  return observable(
    {
      idLookup: observable.map(
        R.map(doc => [SF.prop(idPropName), doc])(docs),
      ),
      get list() {
        return R.compose(Array.from, R.values(this.idLookup))
      },
      upsert(doc) {
        const id = R.propOr(idPropName, nanoid())(doc)
        return pouchStore.put(R.merge(doc, {[idPropName]: id}))
      },
    },
    {upsert: action},
    {name: storeName},
  )
}
