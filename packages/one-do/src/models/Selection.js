import {nullString} from '../lib/little-mst'
import {addDisposer, getRoot, types} from 'mobx-state-tree'
import {clamp, indexOf, isNil, propOr} from 'ramda'
import {findById} from '../lib/little-ramda'
import {reaction} from 'mobx'
import {path} from '../lib/ramda'

export const Selection = types
  .model('Selection', {
    _idx: 0,
    _id: nullString,
    targetPathFromRoot: types.array(types.string),
  })
  .views(self => ({
    itemsFn() {
      return self.items
    },
    get items() {
      return path(self.targetPathFromRoot)(getRoot(self))
    },
    get idx() {
      if (self.items.length === 0) return NaN
      return clamp(0, self.items.length - 1)(self._idx)
    },
    get selectedItem() {
      return self.selectedItemFromId || self.selectedItemFromIdx
    },
    get selectedItemFromIdx() {
      return self.items[self.idx]
    },
    get selectedItemFromId() {
      return findById(self._id)(self.items)
    },
    isSelected(l) {
      return self.selectedItem === l
    },
  }))
  .actions(self => ({
    setSelectedItem(item) {
      self._id = propOr(null)('id')(item)
      if (!isNil(self._id)) {
        self._idx = indexOf(item)(self.items)
      }
    },
    afterCreate() {
      addDisposer(
        self,
        reaction(
          () => self.items,
          () => {
            if (isNil(self.selectedItemFromId)) {
              self.setSelectedItem(self.selectedItemFromIdx)
            }
          },
        ),
      )
    },
  }))
