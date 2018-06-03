const R = require('ramda')
const RA = require('ramda-adjunct')

import {types} from 'mobx-state-tree'
import {optionalNanoId, timestamp} from '../mst-types'

const assert = require('assert')

export const PDBModel = types
  .model('PDBModel', {
    _id: optionalNanoId,
    _rev: types.maybe(types.string),
    deleted: false,
    createdAt: timestamp,
    modifiedAt: timestamp,
  })
  .actions(self => ({
    markDeleted() {
      self.deleted = true
      return self
    },
  }))
  .views(self => ({
    getId() {
      return self._id
    },
    getRevision() {
      return self._rev
    },
    isDeleted() {},
  }))
