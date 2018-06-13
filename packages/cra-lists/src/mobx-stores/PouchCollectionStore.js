import nanoid from 'nanoid'
import {PouchService} from './pouch-service'
import {SF} from '../safe-fun'
import {action, observable} from 'mobx'

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
        this.idLookup.replace(
          new Map(
            R.map(doc => [SF.prop(idPropName, doc), doc])(docs),
          ),
        )
      },
      get list() {
        return Array.from(this.idLookup.values())
      },
      upsert(doc) {
        return pouchStore.put(
          R.merge(
            {
              _id: nanoid(),
              createdAt: Date.now(),
              modifiedAt: Date.now(),
              version: 0,
            },
            doc,
          ),
        )
      },
    },
    {upsert: action},
    {name},
  )
}
