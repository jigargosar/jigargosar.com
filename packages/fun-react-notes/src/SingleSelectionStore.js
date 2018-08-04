import {model, nullNumber} from './little-mst'
import {_compose, _merge, clamp, defaultTo, mathMod} from './ramda'
import {whenKeyPD, withKeyEvent} from './components/utils'

export const SingleSelectionStore = model('SingleSelectionStore')
  .props({
    _selectedIdx: nullNumber,
  })
  .volatile(self => ({
    computedKeys: null,
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
      self.setSelectedIdx(self.keys.indexOf(key))
    },
    setSelectedIdx(idx) {
      self._selectedIdx = mathMod(idx, self.keys.length)
    },
    setComputedKeys(computedKeys) {
      self.computedKeys = computedKeys
    },
    selectNext() {
      self.setSelectedIdx(self.selectedKeyIdx + 1)
    },
    selectPrev() {
      self.setSelectedIdx(self.selectedKeyIdx - 1)
    },
  }))
