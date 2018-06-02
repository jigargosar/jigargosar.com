import {types} from 'mobx-state-tree'
import {nanoId, timestamp} from '../mst-types/nano-id'

const nanoid = require('nanoid')

export const Grain = types
  .model('Grain', {
    id: types.optional(nanoId),
    createdAt: timestamp,
    modifiedAt: timestamp,
    text: types.string,
  })
  .actions(self => ({
    userUpdate(props) {
      const userEditableProps = ['text']
      Object.assign(self, R.pick(userEditableProps))
    },
    setText(text) {
      self.text = text
    },
    getText() {
      return self.text
    },
  }))
