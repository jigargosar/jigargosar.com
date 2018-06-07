import {addDisposer, clone, getType, types} from 'mobx-state-tree'
import plur from 'plur'
import {optionalNanoId, optionalTimestamp} from './mst-types'
import {getAppActorId} from '../stores/actor-id'

const pReflect = require('p-reflect')
const Kefir = require('kefir')

const PouchDB = require('pouchdb-browser')
const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')

const Logger = require('nanologger')

const createDateFrom = arg => new Date(arg)

export const PDBModel = types
  .model('PDBModel', {
    _id: optionalNanoId,
    _rev: types.maybe(types.string),
    deleted: false,
    actorId: getAppActorId(),
    createdAt: optionalTimestamp,
    modifiedAt: optionalTimestamp,
  })
  .preProcessSnapshot(
    R.compose(
      RA.renameKeys({_deleted: 'deleted'}),
      R.evolve({
        createdAt: createDateFrom,
        modifiedAt: createDateFrom,
      }),
    ),
  )
  .actions(self => ({
    userUpdate(props) {
      const omitSystemProps = R.omit([
        '_id',
        '_rev',
        'createdAt',
        'modifiedAt',
        'actorId',
      ])
      const userProps = omitSystemProps(props)
      if (R.equals(userProps, R.pick(R.keys(userProps), self))) {
        return self
      }
      Object.assign(self, userProps)
      self.modifiedAt = Date.now()
      return self
    },
  }))
  .views(self => ({
    get id() {
      return self.getId()
    },
    get rev() {
      return self.getRevision()
    },
    getId() {
      return self._id
    },
    getRevision() {
      return self._rev
    },
    isDeleted() {
      return self.deleted
    },
  }))

const log = new Logger('createPDBChangesStream')

function createPDBChangesStream(opts, db) {
  const stream = Kefir.stream(emitter => {
    const changes = db
      .changes(opts)
      .on('change', emitter.value)
      .on('error', emitter.error)
      .on('completed', value => {
        emitter.value(value)
        emitter.end()
      })
    return () => changes.cancel()
  })
  stream.mapErrors(R.tap(e => log.error(e)))
  return stream
}

function addUnsubscriber(self, subscription) {
  addDisposer(self, () => subscription.unsubscribe())
}

export const createPDBCollection = PDBModel => {
  assert(PDBModel.isType)
  assert(PDBModel.name !== 'AnonymousModel')
  assert(PDBModel.name !== 'PDBModel')
  assert(PDBModel.name.startsWith('PDB'))
  const name = `${plur(PDBModel.name, 2)}Collection`
  const db = new PouchDB(name)
  return types
    .model(name, {
      modelMap: types.optional(types.map(PDBModel), {}),
    })
    .views(self => ({
      getList() {
        const models = Array.from(self.modelMap.values())
        return R.reject(R.prop('deleted'))(models)
      },
      findById(id) {
        return self.modelMap.get(id)
      },
    }))
    .volatile(() => ({log: Logger(name)}))
    .actions(self => {
      return {
        afterCreate() {
          addUnsubscriber(
            self,
            self
              .changesStream({
                include_docs: true,
                live: true,
              })
              .observe({
                value: self._pdOnChange,
                error: e => self.log.error(e),
              }),
          )
        },
        changesStream(opts) {
          return createPDBChangesStream(opts, db)
        },
        async handleFirestoreChange(change) {
          const changeDoc = change.doc
          const changeDocData = changeDoc.data()
          self.log.debug(
            'handleFirestoreChange',
            changeDoc.id,
            changeDoc.metadata,
            changeDocData,
          )
          const docResult = await pReflect(db.get(changeDoc.id))

          self.log.debug(
            'handleFirestoreChange:docResult',
            docResult.isRejected ? docResult.reason : docResult.value,
          )
          const remoteModel = PDBModel.create(
            R.omit(['_rev'])(changeDocData),
          )
          if (docResult.isRejected) {
            return self._putModelInPDB(remoteModel)
          } else {
            const localModel = PDBModel.create(docResult.value)
            if (remoteModel.modifiedAt > localModel.modifiedAt) {
              remoteModel._rev = localModel._rev
              return self._putModelInPDB(remoteModel)
            }
            return Promise.resolve()
          }
        },
        addNew(props) {
          return self._putModelInPDB(PDBModel.create(props))
        },
        markDeletedById(id, revision) {
          return self.userUpdateForId(id, revision, {deleted: true})
        },
        userUpdateForId(id, revision, props) {
          const model = self.findById(id)
          assert(RA.isNotNil(model))
          assert(model.getRevision() === revision)

          const updatedModel = clone(model).userUpdate(props)

          if (R.equals(updatedModel, model)) {
            return Promise.resolve()
          }
          return self._putModelInPDB(updatedModel)
        },

        _pdOnChange(change) {
          self.modelMap.put(change.doc)
        },
        _putModelInPDB(model) {
          assert(getType(model) === PDBModel)
          return db.put(model)
        },
      }
    })
}
