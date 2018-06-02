import {BaseModel} from './base-model'
import {types} from 'mobx-state-tree'

const R = require('ramda')
const RA = require('ramda-adjunct')

const assert = require('assert')

export const Grain = BaseModel.named('Grain')
  .props({
    text: types.optional(types.string, () => ''),
  })
  .views(self => ({
    getText() {
      return self.text
    },
    getUserEditableProps() {
      return ['text']
    },
  }))

// .actions(self => ({
//   setText(text){
//     return self.text = text
//   }
// }))
