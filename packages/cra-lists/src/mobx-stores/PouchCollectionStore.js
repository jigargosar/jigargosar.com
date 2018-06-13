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
      get active() {
        return R.reject(SF.prop('isArchived'), this.list)
      },
      get archived() {
        return R.filter(SF.prop('isArchived'), this.list)
      },
      upsert(doc) {
        const updatedDoc = R.ifElse(
          R.has(idPropName),
          R.merge({modifiedAt: Date.now()}),
          R.merge({
            _id: nanoid(),
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            version: 0,
            isArchived: false,
          }),
        )(doc)
        return pouchStore.put(updatedDoc)
      },
    },
    {upsert: action},
    {name},
  )
}
