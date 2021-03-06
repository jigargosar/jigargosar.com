import nanoid from 'nanoid'
import {PouchDBService} from '../lib/PouchDBService'
import {SF} from '../safe-fun'
import {action, observable} from 'mobx'
import {getAppActorId} from '../lib/app-actor-id'
import {FirePouchSync} from './FirePouchSync'

const m = require('mobx')
m.configure({
  // isolateGlobalState: true,
  // disableErrorBoundaries: true,
  // computedRequiresReaction: true,
  enforceActions: true,
})

const R = require('ramda')
const idPropName = '_id'

function toIdDocPairs(results) {
  return R.map(
    R.compose(doc => [SF.prop(idPropName, doc), doc], SF.prop('doc')),
  )(results)
}

export function PouchCollectionStore(modelName, initialItems = []) {
  const name = `${modelName}Collection`
  const pouchStore = PouchDBService.create(name)
  const pouchCollectionStore = m.observable(
    {
      get name() {
        return name
      },
      firePouchSync: FirePouchSync(pouchStore),
      get pouchStore() {
        return pouchStore
      },
      idLookup: m.observable.map(toIdDocPairs(initialItems), {
        name: 'idLookup',
      }),
      get items() {
        return this.idLookup.values()
      },
      setIdLookup(idLookup) {
        this.idLookup.replace(idLookup)
      },
      handleChange(change) {
        const doc = this.idLookup.get(change.id)
        if (doc) {
          Object.assign(doc, change.doc)
        } else {
          this.idLookup.set(change.id, change.doc)
        }
      },
      async load() {
        const {results, last_seq} = await pouchStore.allChanges()
        const idLookup = toIdDocPairs(results)
        this.setIdLookup(idLookup)

        pouchStore
          .liveChanges({since: last_seq})
          .on('change', this.handleChange)
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
          R.mergeDeepLeft({
            modifiedAt: Date.now(),
            actorId: getAppActorId(),
            skipFirestoreSync: false,
          }),
          R.mergeDeepLeft({
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
      setIdLookup: action.bound,
      handleChange: action.bound,
      load: action.bound,
      userUpsert: action.bound,
    },
    {name},
  )
  pouchCollectionStore.load()
  return pouchCollectionStore
}
