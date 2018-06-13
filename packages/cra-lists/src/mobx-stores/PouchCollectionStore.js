import nanoid from 'nanoid'
import {PouchService} from './pouch-service'
import {SF} from '../safe-fun'
import {observable, action} from 'mobx'

const R = require('ramda')
const idPropName = '_id'

export function PouchCollectionStore(modelName) {
  const name = `${modelName}Collection`
  const pouchStore = PouchService.create(name)
  return observable(
    {
      idLookup: observable.map(),
      async load() {
        const docs = await pouchStore.getAll()
        this.idLookup = new Map(
          R.map(doc => [SF.prop(idPropName), doc])(docs),
        )
      },
      get list() {
        return Array.from(this.idLookup.values())
      },
      upsert(doc) {
        const id = R.propOr(idPropName, nanoid())(doc)
        return pouchStore.put(R.merge(doc, {[idPropName]: id}))
      },
    },
    {upsert: action},
    {name},
  )
}
