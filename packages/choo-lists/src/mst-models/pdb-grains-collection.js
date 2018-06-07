import {types} from 'mobx-state-tree'
import {createPDBCollection, PDBModel} from './pdb-collection'

const R = require('ramda')
const RA = require('ramda-adjunct')

const assert = require('assert')

export const PDBGrain = PDBModel.named('PDBGrain')
  .props({
    text: types.string,
  })
  .views(self => ({
    getText() {
      return self.text
    },
  }))

export const PDBGrainsCollection = createPDBCollection(
  PDBGrain,
).actions(self => ({
  promptAndAddNew() {
    const text = prompt('New Grain', 'Get Milk!')
    if (R.isNil(text)) return
    return self.addNew({text: text})
  },
}))
