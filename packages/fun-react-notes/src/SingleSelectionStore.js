import {computed, model, nullNumber} from './little-mst'
import {__, _compose, _merge, defaultTo, mathMod} from './ramda'
import {whenKeyPD, withKeyEvent} from './components/utils'

export const SingleSelectionStore = model('SingleSelectionStore')
  .props({
    _selectedIdx: nullNumber,
  })
  .volatile(self => ({
    computedKeys: computed(() => []),
  }))
  .views(self => ({
    get keys() {
      return self.computedKeys.get()
    },
    get selectedIdx() {
      if (self.keys.length === 0) {
        return NaN
      }
      return _compose(mathMod(__, self.keys.length), defaultTo(0))(
        self._selectedIdx,
      )
    },
    set selectedIdx(idx) {
      self._selectedIdx = mathMod(idx, self.keys.length)
    },
    getContainerProps(props = {}) {
      return _merge(
        {
          onKeyDown: withKeyEvent(
            whenKeyPD('down')(self.selectNext),
            whenKeyPD('up')(self.selectPrev),
          ),
          tabIndex: 0,
        },
        props,
      )
    },
    getItemProps(props = {}) {
      return _merge(
        {
          onClick: () => {
            self.setSelectedKey(props.key)
          },
        },
        props,
      )
    },
  }))
  .actions(self => ({
    setSelectedKey(key) {
      self.selectedIdx = self.keys.indexOf(key)
    },
    setComputedKeys(computedKeys) {
      self.computedKeys = computedKeys
    },
    selectNext() {
      self.selectedIdx = self.selectedIdx + 1
    },
    selectPrev() {
      self.selectedIdx = self.selectedIdx - 1
    },
  }))
