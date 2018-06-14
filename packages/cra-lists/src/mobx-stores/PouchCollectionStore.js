import nanoid from 'nanoid'
import {PouchService} from './PouchService'
import {SF} from '../safe-fun'
import {configure, observable, runInAction} from 'mobx'
import {getAppActorId} from '../LocalStorage'

configure({
  // isolateGlobalState: true,
  // disableErrorBoundaries: true,
  // computedRequiresReaction: true,
  enforceActions: true,
})

const R = require('ramda')
const idPropName = '_id'

export function PouchCollectionStore(modelName) {
  const name = `${modelName}Collection`
  const pouchStore = PouchService.create(name)
  return observable(
    {
      pouchStore,
      name,
      idLookup: observable.map([]),
      async load() {
        const {results, last_seq} = await pouchStore.allChanges()
        const idLookup = R.map(
          R.compose(
            doc => [SF.prop(idPropName, doc), doc],
            SF.prop('doc'),
          ),
        )(results)
        runInAction(() => this.idLookup.replace(idLookup))

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
      userUpsert(doc) {
        const updatedDoc = R.ifElse(
          R.has(idPropName),
          R.merge({modifiedAt: Date.now(), actorId: getAppActorId()}),
          R.merge({
            _id: nanoid(),
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            version: 0,
            isArchived: false,
            actorId: getAppActorId(),
          }),
        )(doc)
        return pouchStore.put(updatedDoc)
      },
    },
    {
      idLookup: observable,
    },
    {name},
  )
}
