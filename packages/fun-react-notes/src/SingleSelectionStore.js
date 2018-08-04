import {model, nullString} from './little-mst'
import {
  _compose,
  _merge,
  _when,
  defaultTo,
  head,
  isNil,
  mathMod,
} from './ramda'
import {whenKeyPD, withKeyEvent} from './components/utils'

export const SingleSelectionStore = model('SingleSelectionStore')
  .props({
    _selectedKey: nullString,
    // keys: optional(stringArray, []),
  })
  .volatile(self => ({
    keys: [],
  }))
  .views(self => ({
    get selectedKey() {
      return _when(isNil)(() => head(self.keys))(self._selectedKey)
    },
    get selectedKeyIdx() {
      if (self.keys.length === 0) {
        return NaN
      }
      const idx = self.keys.indexOf(self.selectedKey)
      return idx === -1 ? 0 : idx
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
      self._selectedKey = key
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
