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
    userUpdate(props) {
      const omitSystemProps = R.omit([
        '_id',
        '_rev',
        'createdAt',
        'modifiedAt',
      ])
      const prev = omitSystemProps(self)
      const next = omitSystemProps(props)
      if (R.equals(prev, next)) return self
      Object.assign(self, next)
      self.modifiedAt = Date.now()
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
