const R = require('ramda')
const RA = require('ramda-adjunct')

import {types} from 'mobx-state-tree'
import {nanoId, timestamp} from '../mst-types'

const assert = require('assert')

export const BaseModel = types
  .model('Grain', {
    id: nanoId,
    createdAt: timestamp,
    modifiedAt: timestamp,
  })
  .actions(self => ({
    afterCreate() {
      assert(RA.isArray(self.getUserEditableProps()))
    },
    userPatchProps(props) {
      assert(R.compose(R.isEmpty, R.omit(self.getUserEditableProps()))(props))
      Object.assign(self, R.pick(self.userEditableProps, props))
    },
  }))

export const Grain = BaseModel.named('Grain')
  .props('Grain', {
    text: types.string,
  })
  .views(self => ({
    getText() {
      return self.text
    },

    getUserEditableProps() {
      return ['text']
    },
  }))
  .actions(self => ({
    getText() {
      return self.text
    },

    getUserEditableProps() {
      return ['text']
    },
  }))
