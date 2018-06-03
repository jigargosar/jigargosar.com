import {types} from 'mobx-state-tree'
import {PDBModel} from './pdb-model'
import {createPDBCollection} from './pdb-collection'

const R = require('ramda')
const RA = require('ramda-adjunct')

const assert = require('assert')

export const PDBGrain = PDBModel.named('PDBGrain')
  .props({
    text: types.optional(types.string, ''),
  })
  .views(self => ({
    getText() {
      return self.text
    },
  }))

export const PDBGrainsCollection = createPDBCollection(PDBGrain).actions(
  self => ({
    addNew() {
      const text = prompt('New Grain', 'Get Milk!')
      if (R.isNil(text)) return
      return self._addNew({text: text})
    },
  }),
)
