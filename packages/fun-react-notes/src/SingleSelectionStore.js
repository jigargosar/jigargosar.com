import {computed, model, nullNumber} from './little-mst'
import {_compose, _merge, clamp, defaultTo, mathMod} from './ramda'
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
    get selectedKeyIdx() {
      if (self.keys.length === 0) {
        return NaN
      }
      return _compose(clamp(0)(self.keys.length - 1), defaultTo(0))(
        self._selectedIdx,
      )
    },
    set selectedIdx(idx) {
      self._selectedIdx = mathMod(idx, self.keys.length)
    },

    get selectedIdx() {
      return self.selectedKeyIdx
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
      self.selectedIdx = self.selectedKeyIdx + 1
    },
    selectPrev() {
      self.selectedIdx = self.selectedKeyIdx - 1
    },
  }))
