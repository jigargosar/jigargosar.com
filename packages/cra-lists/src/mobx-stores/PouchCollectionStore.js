import nanoid from 'nanoid'
import {PouchService} from './pouch-service'
import {SF} from '../safe-fun'
import {
  action,
  computed,
  configure,
  observable,
  runInAction,
} from 'mobx'

configure({
  // disableErrorBoundaries: true,
  computedRequiresReaction: true,
  enforceActions: true,
})

const R = require('ramda')
const idPropName = '_id'

export function PouchCollectionStore(modelName) {
  const name = `${modelName}Collection`
  const pouchStore = PouchService.create(name)
  return observable(
    {
      idLookup: observable.map([]),
      setIdLookup(idLookup) {
        this.idLookup = idLookup
      },
      async load() {
        console.warn('loading')
        const {results, last_seq} = await pouchStore.allChanges()
        this.setIdLookup(
          new Map(
            R.map(
              R.compose(
                observable,
                doc => [SF.prop(idPropName, doc), doc],
                SF.prop('doc'),
              ),
            )(results),
          ),
        )

        pouchStore
          .liveChanges({since: last_seq})
          .on('change', change => {
            runInAction(() => {
              const doc = this.idLookup.get(change.id)
              if (doc) {
                Object.assign(doc, change.doc)
              } else {
                this.idLookup.set(change.id, change.doc)
              }
            })
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
      get hasArchived() {
        return this.archived.length > 0
      },
      get splitList() {
        return Array.from(R.concat(this.active, this.archived))
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
    {
      idLookup: observable,
      setIdLookup: action,
      upsert: action,
      list: computed,
      active: computed,
      archived: computed,
    },
    {name},
  )
}
