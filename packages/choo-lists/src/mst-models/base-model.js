const R = require('ramda')
const RA = require('ramda-adjunct')

import {types} from 'mobx-state-tree'
import {nanoId, timestamp} from '../mst-types'

const assert = require('assert')

export const BaseModel = types
  .model('BaseModel', {
    id: nanoId,
    createdAt: timestamp,
    modifiedAt: timestamp,
  })

  .actions(self => ({
    afterCreate() {
      assert(RA.isArray(self.getUserEditableProps()))
    },
    userPatchProps(props) {
      const userEditableProps = self.getUserEditableProps();
      assert(R.compose(R.isEmpty, R.omit(userEditableProps))(props))

      Object.assign(self, R.pick(userEditableProps, props))
    },
  }))
