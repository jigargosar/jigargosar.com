import {addDisposer, clone, getType, types} from 'mobx-state-tree'
import plur from 'plur'

const PouchDB = require('pouchdb-browser')
const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')

const Logger = require('nanologger')

export const createPDBCollection = PDBModel => {
  assert(PDBModel.isType)
  assert(PDBModel.name !== 'AnonymousModel')
  assert(PDBModel.name !== 'PDBModel')
  assert(PDBModel.name.startsWith('PDB'))
  const name = `${plur(PDBModel.name, 2)}Collection`
  const db = new PouchDB(name)
  const log = Logger(name)

  const putModelInPDB = function(model) {
    assert(getType(model) === PDBModel)
    return db.put(model)
  }
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
    .volatile(() => ({log}))
    .actions(self => {
      return {
        afterCreate() {
          const disposer = db
            .changes({
              include_docs: true,
              live: true,
            })
            .on('change', self._pdOnChange)
          addDisposer(self, () => disposer.cancel())
        },

        changes(opts) {
          return db.changes(opts)
        },

        addNew(props) {
          return putModelInPDB(PDBModel.create(props))
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
          return putModelInPDB(updatedModel)
        },

        _pdOnChange(change) {
          self.modelMap.put(change.doc)
        },
      }
    })
}
