import {getAppActorId} from '../stores/actor-id'
import {types} from 'mobx-state-tree'
import {optionalNanoId, timestamp} from '../mst-types'

const R = require('ramda')
const RA = require('ramda-adjunct')

const assert = require('assert')

export const PDBModel = types
  .model('PDBModel', {
    _id: optionalNanoId,
    _rev: types.maybe(types.string),
    deleted: false,
    actorId: getAppActorId(),
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
    getId() {
      return self._id
    },
    getRevision() {
      return self._rev
    },
    isDeleted() {},
  }))
