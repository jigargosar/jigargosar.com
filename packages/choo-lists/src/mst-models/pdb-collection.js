import {addDisposer, clone, getType, types} from 'mobx-state-tree'
import plur from 'plur'
import {nanoId} from './mst-types'
import {getAppActorId} from '../stores/actor-id'
import nanoid from 'nanoid'

const R = require('ramda')
const RA = require('ramda-adjunct')

const pReflect = require('p-reflect')
const Kefir = require('kefir')

const PouchDB = require('pouchdb-browser')
const assert = require('assert')

const Logger = require('nanologger')

export const PDBModel = types
  .model('PDBModel', {
    _id: nanoId,
    _rev: types.maybe(types.string),
    deleted: types.boolean,
    actorId: types.refinement(
      'actorId',
      types.string,
      RA.isNonEmptyString,
    ),
    createdAt: types.number,
    modifiedAt: types.number,
  })
  .preProcessSnapshot(R.compose(RA.renameKeys({_deleted: 'deleted'})))
  .actions(self => ({
    userUpdate(props) {
      const omitSystemProps = R.omit([
        '_id',
        '_rev',
        'createdAt',
        'modifiedAt',
        'actorId',
      ])
      const userProps = R.compose(
        R.merge({actorId: getAppActorId()}),
        omitSystemProps,
      )(props)
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
              .bufferWithTimeOrCount(100, 100)
              .map(self._pdOnChanges)
              .observe({
                error(error) {
                  log.error(error)
                },
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
              return self._putModelInPDB(
                PDBModel.create(
                  R.merge(remoteModel, R.pick(['_rev'], localModel)),
                ),
              )
            }
            return Promise.resolve()
          }
        },
        addNew(props) {
          const model = PDBModel.create(
            R.merge(props, {
              _id: nanoid(),
              _rev: null,
              deleted: false,
              actorId: getAppActorId(),
              createdAt: Date.now(),
              modifiedAt: Date.now(),
            }),
          )
          return self._putModelInPDB(model)
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

        _put(model) {
          return self.modelMap.put(model)
        },
        _pdOnChanges(changes) {
          R.forEach(R.compose(self._put, R.prop('doc')))(changes)
          return self
        },
        _putModelInPDB(model) {
          assert(getType(model) === PDBModel)
          return db.put(model)
        },
      }
    })
}
