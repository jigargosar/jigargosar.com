import {model, nullNumber} from './little-mst'
import {_compose, _merge, clamp, defaultTo, isNil, mathMod} from './ramda'
import {whenKeyPD, withKeyEvent} from './components/utils'

export const SingleSelectionStore = model('SingleSelectionStore')
  .props({
    _selectedIdx: nullNumber,
    // keys: optional(stringArray, []),
  })
  .volatile(self => ({
    keys: [],
  }))
  .views(self => ({
    get selectedKeyIdx() {
      if (self.keys.length === 0) {
        return NaN
      }
      return clamp(0, self.keys.length - 1)(self._selectedIdx)
    },
    getContainerProps(props = {}) {
      return _merge(self.containerProps, props)
    },
    get containerProps() {
      return {
        onKeyDown: withKeyEvent(
          whenKeyPD('down')(self.selectNext),
          whenKeyPD('up')(self.selectPrev),
        ),
        tabIndex: 0,
      }
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
      self._selectedIdx = self.keys.indexOf(key)
    },
    setKeys(keys) {
      self.keys = keys
    },
    selectNext() {
      const nextIdx = _compose(defaultTo(null), mathMod)(
        self.selectedKeyIdx + 1,
        self.keys.length,
      )
      self.setSelectedKey(isNil(nextIdx) ? null : self.keys[nextIdx])
    },
    selectPrev() {
      const nextIdx = _compose(defaultTo(null), mathMod)(
        self.selectedKeyIdx - 1,
        self.keys.length,
      )
      self.setSelectedKey(isNil(nextIdx) ? null : self.keys[nextIdx])
    },
  }))
