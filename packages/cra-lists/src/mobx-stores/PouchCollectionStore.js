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
        const {results, last_seq} = await pouchStore.allChanges()
        this.idLookup.replace(
          new Map(
            R.map(
              R.compose(
                doc => [SF.prop(idPropName, doc), doc],
                SF.prop('doc'),
              ),
            )(results),
          ),
        )

        pouchStore
          .liveChanges({since: last_seq})
          .on('change', change => {
            this.idLookup.set(change.id, change.doc)
          })
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
