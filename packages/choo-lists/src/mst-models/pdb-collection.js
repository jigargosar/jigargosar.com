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

  const putModelInPDB = function (model) {
    assert(getType(model) === PDBModel)
    db.put(model)
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

        addNew(props) {
          return putModelInPDB(PDBModel.create(props))
        },

        markDeletedById(id) {
          const model = self.modelMap.get(id);
          assert(RA.isNotNil(model))
          const clonedModel = clone(model)
          return putModelInPDB(clonedModel.markDeleted())
        },

        _pdPut(model) {
          assert(getType(model) === PDBModel)
          db.put(model)
        },
        _pdOnChange(change) {
          self.modelMap.put(change.doc)
        },
      }
    })
}
