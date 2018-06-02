const R = require('ramda')
const RA = require('ramda-adjunct')

import {types} from 'mobx-state-tree'
import {optionalNanoId, timestamp} from '../mst-types'

const assert = require('assert')

export const BaseModel = types
  .model('BaseModel', {
    id: optionalNanoId,
    createdAt: timestamp,
    modifiedAt: timestamp,
  })
  .preProcessSnapshot(snapshot => {
    assert(RA.isNotNil(snapshot))
    return RA.renameKeys({_id:"id"})(snapshot)
  })
  .actions(self => ({
    afterCreate() {
      assert(RA.isArray(self.getUserEditableProps()))
    },
    userPatchProps(props) {
      const userEditableProps = self.getUserEditableProps()
      assert(R.compose(R.isEmpty, R.omit(userEditableProps))(props))

      Object.assign(self, R.pick(userEditableProps, props))
    },
  }))
