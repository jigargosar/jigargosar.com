import {BaseModel} from './base-model'
import {types} from 'mobx-state-tree'
import {createCollectionStore} from "./collection-store";

const R = require('ramda')
const RA = require('ramda-adjunct')

const assert = require('assert')

export const Grain = BaseModel.named('Grain')
  .props({
    text: types.optional(types.string, ''),
  })
  .views(self => ({
    getText() {
      return self.text
    },
    getUserEditableProps() {
      return ['text', 'deleted']
    },
  }))

export const GrainsStore = createCollectionStore(Grain)
