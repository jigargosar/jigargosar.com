const R = require('ramda')
const RA = require('ramda-adjunct')

import {types} from 'mobx-state-tree'
import {optionalNanoId, timestamp} from '../mst-types'

const assert = require('assert')

export const BaseModel = types
  .model('BaseModel', {
    id: optionalNanoId,
    deleted: false,
    createdAt: timestamp,
    modifiedAt: timestamp,
  })
  .preProcessSnapshot(snapshot => {
    assert(RA.isNotNil(snapshot))
    return RA.renameKeys({_id: 'id', _deleted: 'deleted'})(snapshot)
  })
  .actions(self => ({
    afterCreate() {
      assert(RA.isArray(self.getUserEditableProps()))
    },
    userPatchProps(props) {
      const userEditableProps = self.getUserEditableProps()
      assert(R.compose(R.isEmpty, R.omit(userEditableProps))(props))

      const modifiedProps = R.pick(userEditableProps, props)
      const existingProps = R.pick(userEditableProps, self)
      if (!R.equals(modifiedProps, existingProps)) {
        Object.assign(self, modifiedProps, {modifiedAt: Date.now()})
      }
    },
    markDeleted() {
      self.userPatchProps({deleted: true})
    },
  }))
